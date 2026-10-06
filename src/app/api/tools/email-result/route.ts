import { publicJson } from "@/lib/public-json";
import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getOptionalApiUser, getRequestIp, checkDistributedRateLimit, rateLimitResponse } from "@/lib/api-security";
import { sendToolResultEmailDetailed } from "@/lib/emails";
import { prisma } from "@/lib/prisma";
import { normalizeHistoryToolType, inferResultFileType } from "@/lib/results";
import { prepareEmailFile, resolveEmailFile, verifyEmailFileProof, restoreEmailFileUpload } from "@/lib/server/email-result-file";
import { getResultEmailJob, getResultEmailQuota, reserveResultEmail, updateResultEmailJob, resultEmailTier, emailOwnerHash } from "@/lib/result-email-quota";
import { getMostRecentResetTimestamp } from "@/lib/daily-cycle";
import { RESULT_EMAIL_LIMITS } from "@/config/result-email-policy";

// Disposable / temporary email domain blocklist to preserve deliverability
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "trashmail.com",
  "sharklasers.com",
  "dispostable.com",
  "getnada.com",
  "fakemailgenerator.com",
  "yopmail.com",
  "throwawaymail.com",
  "mohmal.com",
  "burnermail.io",
  "inboxkitten.com",
  "crazymailing.com",
  "tmpmail.net",
  "tempail.com",
  "generator.email",
  "emailondeck.com",
  "tempmail.ninja",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "tinemail.com",
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function emailContext(req: NextRequest) {
  const user = await getOptionalApiUser();
  if (!user) return { user, owner: `ip:${getRequestIp(req)}`, tier: 'guest' as const };
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { plan: true, subscriptionStatus: true, planExpiresAt: true, status: true } });
  if (!account || account.status !== 'active') throw new Error('Account unavailable');
  return { user, owner: `user:${user.id}`, tier: resultEmailTier(account) };
}
const pendingResponse = (quota: unknown, uncertain = false) => publicJson({
  pending: true,
  message: uncertain
    ? 'We could not confirm delivery. Please check your inbox. This request will not be resent automatically; one daily slot is held until the next reset.'
    : 'This email is already being processed. Please check your inbox before trying another send.',
  quota,
}, { status: 202 });
const unavailableResponse = () => publicJson({ error: 'Email delivery is temporarily unavailable. Please try again shortly.' }, { status: 503 });

export async function GET(req: NextRequest) {
  try { return publicJson({ quota: await getResultEmailQuota(await emailContext(req)) }, { headers: { 'Cache-Control': 'private, no-store' } }); }
  catch (error) { console.error('[Email Result] Allowance unavailable:', error); return unavailableResponse(); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return publicJson({ error: 'Invalid email request.' }, { status: 400 });
    const { email, toolType, toolName, title, content, fileUrl, metadata, action, fileSize, fileMime, fileProof, fileDigest, requestId } = body as {
      email?: string; toolType?: string; toolName?: string; title?: string; content?: string; fileUrl?: string;
      metadata?: Record<string, unknown>; action?: string; fileSize?: number; fileMime?: string;
      fileProof?: string; fileDigest?: string; requestId?: string;
    };
    if ([email, toolType, toolName, title, content, fileUrl, action, fileMime, fileProof, fileDigest, requestId].some(value => value !== undefined && typeof value !== 'string')
      || (email?.length || 0) > 254 || (content?.length || 0) > 50_000 || (title?.length || 0) > 500
      || (fileUrl?.length || 0) > 8000 || (fileProof?.length || 0) > 3000 || (toolName?.length || 0) > 200 || (toolType?.length || 0) > 100
      || (metadata && (typeof metadata !== 'object' || Array.isArray(metadata) || JSON.stringify(metadata).length > 12_000))) {
      return publicJson({ error: 'Invalid or oversized email request.' }, { status: 400 });
    }
    if (!requestId || !UUID.test(requestId)) return publicJson({ error: 'Please refresh the page and try emailing your result again.' }, { status: 400 });
    if (action && action !== 'prepare-upload') return publicJson({ error: 'Invalid email request.' }, { status: 400 });
    if (!email || !EMAIL_REGEX.test(email.trim())) return publicJson({ error: 'Please provide a valid email address.' }, { status: 400 });
    const cleanEmail = email.trim().toLowerCase();
    if (DISPOSABLE_EMAIL_DOMAINS.has(cleanEmail.split('@')[1])) return publicJson({ error: 'Temporary email addresses are not supported. Please use a personal or work email address.' }, { status: 400 });
    const preparing = action === 'prepare-upload';
    const hasUpload = preparing || !!fileProof || !!fileDigest;
    if (hasUpload && (!fileDigest || !/^[a-f0-9]{64}$/.test(fileDigest) || !Number.isSafeInteger(fileSize) || !fileSize || fileSize < 1 || fileSize > 20 * 1024 * 1024 || !fileMime || fileMime.length > 100 || fileUrl)) return publicJson({ error: 'Please select a valid result file up to 20 MB.' }, { status: 400 });
    if (!preparing && !content?.trim() && !fileUrl?.trim() && !fileProof) return publicJson({ error: 'No content or file provided to email.' }, { status: 400 });
    if (fileUrl && !/^https:\/\//i.test(fileUrl.trim())) return publicJson({ error: 'Please refresh and upload this result before emailing it.' }, { status: 400 });

    const context = await emailContext(req);
    const fingerprint = createHash('sha256').update(JSON.stringify({
      email: cleanEmail, toolType: toolType || 'studio', toolName: toolName || 'Exismic Tool', title: title || 'Your Generation',
      content: content?.trim() || '', file: hasUpload ? { digest: fileDigest, size: fileSize, mime: fileMime } : (fileUrl?.trim() || ''),
    })).digest('hex');
    const existing = await getResultEmailJob(context, requestId);
    // Replays never use another daily slot or call the mail provider again.
    if (existing) {
      if (existing.job.fingerprint !== fingerprint) return publicJson({ error: 'This request has changed. Please start a new email request.', restartRequest: true }, { status: 409 });
      if (existing.job.state === 'sent') return publicJson({ success: true, message: 'This result has already been sent.', quota: await getResultEmailQuota(context) });
      if (existing.job.state === 'sending' || existing.job.state === 'uncertain') return pendingResponse(await getResultEmailQuota(context), existing.job.state === 'uncertain');
      if (existing.job.state === 'failed' || existing.job.reservedUntil <= Date.now()) return publicJson({ error: 'Please start a new email request for this result.', restartRequest: true, quota: await getResultEmailQuota(context) }, { status: 409 });
      if (preparing) {
        const quota = await getResultEmailQuota(context);
        if (quota.used + quota.reserved > quota.limit) return publicJson({ error: 'Your daily email allowance has been reached.', quota }, { status: 429 });
        return existing.job.upload ? publicJson({ success: true, upload: restoreEmailFileUpload({
          email: cleanEmail, owner: context.owner, size: fileSize!, mime: fileMime!, title: title || 'Exismic-result',
          ...existing.job.upload, expiresAt: existing.job.reservedUntil,
        }), quota }) : pendingResponse(quota);
      }
    }
    const rateStage = preparing ? 'prepare' : 'send';
    const attempts = await checkDistributedRateLimit(`result-email-attempts:${rateStage}:${context.owner}`, context.tier === 'pro' ? 200 : context.tier === 'free' ? 40 : 10, 3600_000);
    if (!attempts.allowed) return rateLimitResponse(attempts.retryAfter, attempts.unavailable);
    const cooldown = await checkDistributedRateLimit(`result-email-cooldown:${rateStage}:${context.owner}`, 1, context.user ? 15_000 : 60_000);
    if (!cooldown.allowed) return rateLimitResponse(cooldown.retryAfter, cooldown.unavailable);

    const reservation = await reserveResultEmail(context, requestId, fingerprint, preparing);
    if (reservation.kind === 'sent') return publicJson({ success: true, message: 'This result has already been sent.', quota: reservation.quota });
    if (reservation.kind === 'pending') return pendingResponse(reservation.quota);
    if (reservation.kind === 'upload') return publicJson({ success: true, upload: restoreEmailFileUpload({
      email: cleanEmail, owner: context.owner, size: fileSize!, mime: fileMime!, title: title || 'Exismic-result',
      ...reservation.upload, expiresAt: reservation.reservedUntil,
    }), quota: reservation.quota });
    if (reservation.kind === 'expired' || reservation.kind === 'conflict') return publicJson({ error: 'Please start a new email request for this result.', restartRequest: true, quota: reservation.quota }, { status: 409 });
    if (reservation.kind === 'limited') return publicJson({
      error: `Your ${reservation.quota.limit} daily result-email slots are used or reserved. Please wait until the next reset.`,
      guestLimitReached: context.tier === 'guest', quota: reservation.quota,
    }, { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil((Date.parse(reservation.quota.resetsAt) - Date.now()) / 1000))) } });

    let uploaded: Awaited<ReturnType<typeof resolveEmailFile>> | undefined;
    try {
      if (preparing) {
        // Bound abandoned/rejected uploads too, without charging the successful-send allowance.
        const cycle = getMostRecentResetTimestamp().getTime();
        const budget = await checkDistributedRateLimit(`result-email-upload-budget:${cycle}:${context.owner}`, RESULT_EMAIL_LIMITS[context.tier] * 2, 86400_000);
        if (!budget.allowed) {
          await updateResultEmailJob(reservation.identifier, reservation.token, { ...reservation.job, state: 'failed' });
          if (budget.unavailable) return unavailableResponse();
          return publicJson({ error: 'You have reached today’s file-email upload limit. Please download this file directly or try again after the reset.', restartRequest: true, quota: await getResultEmailQuota(context) },
            { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil((Date.parse(reservation.quota.resetsAt) - Date.now()) / 1000))) } });
        }
        const upload = await prepareEmailFile({ email: cleanEmail, owner: context.owner, size: fileSize!, mime: fileMime!, title: title || 'Exismic-result', expiresAt: reservation.job.reservedUntil });
        const token = await updateResultEmailJob(reservation.identifier, reservation.token, { ...reservation.job, state: 'prepared', upload: { path: upload.path, token: upload.token } });
        if (!token) return pendingResponse(await getResultEmailQuota(context));
        return publicJson({ success: true, upload, quota: reservation.quota });
      }
      if (fileProof) {
        const proof = verifyEmailFileProof(fileProof, cleanEmail, context.owner);
        if (!reservation.job.upload || proof.path !== reservation.job.upload.path || proof.size !== fileSize || proof.mime !== fileMime?.split(';')[0].toLowerCase().trim()) throw new Error('Invalid result file.');
        uploaded = await resolveEmailFile(fileProof, cleanEmail, context.owner);
        if (createHash('sha256').update(uploaded.attachment.content).digest('hex') !== fileDigest) throw new Error('Result file changed.');
      } else if (hasUpload) throw new Error('Incomplete file upload.');
    } catch (error) {
      console.error('[Email Result] File preparation failed:', error);
      await updateResultEmailJob(reservation.identifier, reservation.token, { ...reservation.job, state: 'failed' });
      return publicJson({ error: 'Could not prepare the result file. Please select it again and retry.', restartRequest: true, quota: await getResultEmailQuota(context) }, { status: 400 });
    }
    // Claim once, before sending. A crash after this point leaves a reservation, never a duplicate send.
    if (reservation.job.reservedUntil <= Date.now()) return publicJson({ error: 'This email request expired. Please try again.', restartRequest: true }, { status: 409 });
    const sendingToken = await updateResultEmailJob(reservation.identifier, reservation.token, { ...reservation.job, state: 'sending' });
    if (!sendingToken) return pendingResponse(await getResultEmailQuota(context));
    const resultUrl = uploaded?.url || fileUrl?.trim();
    const delivery = await sendToolResultEmailDetailed({
      email: cleanEmail, toolType: toolType || 'studio', toolName: toolName || 'Exismic Tool', title: title || 'Your Generation',
      content: content?.trim(), fileUrl: resultUrl, fileExpiresAt: uploaded?.expiresAt, attachment: uploaded?.attachment,
    }, `result-export-v1/${emailOwnerHash(context.owner)}/${requestId}`);
    let finished: string | null;
    try {
      finished = await updateResultEmailJob(reservation.identifier, sendingToken, {
        ...reservation.job, providerId: delivery.providerId,
        state: delivery.status === 'accepted' ? 'sent' : delivery.status === 'rejected' ? 'failed' : 'uncertain',
      });
    } catch (error) {
      console.error('[Email Result] Delivery receipt needs reconciliation:', { requestId, providerId: delivery.providerId, error });
      return unavailableResponse();
    }
    if (!finished || delivery.status === 'uncertain') return pendingResponse(await getResultEmailQuota(context), delivery.status === 'uncertain');
    // This known rejection contains only our own message and server-calculated allowance.
    // Keep retry metadata; the generic 5xx sanitizer intentionally removes arbitrary details.
    if (delivery.status === 'rejected') return NextResponse.json({ error: 'The email could not be sent. Your daily slot was returned. Please try again later.', restartRequest: true, quota: await getResultEmailQuota(context) }, { status: 503 });

    if (context.user && toolType) {
      try {
        const normalizedToolType = normalizeHistoryToolType(toolType);
        await prisma.userFile.create({ data: {
          userId: context.user.id, toolType: normalizedToolType, originalName: title || `${toolName || 'Tool'} Output`,
          resultUrl: resultUrl || null, fileType: inferResultFileType({ toolType: normalizedToolType, resultUrl, mimeType: uploaded?.mime }), status: 'completed',
          metadata: { ...(metadata || {}), emailedTo: cleanEmail, contentSnippet: content ? content.slice(0, 500) : null, ...(uploaded ? { emailDownloadExpiresAt: uploaded.expiresAt } : {}) },
        } });
      } catch (error) { console.warn('[Email Result] Library save could not finish:', error); }
    }
    return publicJson({ success: true, message: `Result sent successfully to ${cleanEmail}`, quota: await getResultEmailQuota(context) });
  } catch (error) {
    if (error instanceof SyntaxError) return publicJson({ error: 'Invalid email request.' }, { status: 400 });
    console.error('[EMAIL_RESULT_POST]', error);
    return unavailableResponse();
  }
}
