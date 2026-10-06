import { createClient } from '@supabase/supabase-js';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const EMAIL_FILE_MAX_BYTES = 20 * 1024 * 1024;
const BUCKET = 'email-results';
const LINK_TTL = 7 * 24 * 60 * 60;
const EXTENSIONS: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/avif': 'avif',
  'application/pdf': 'pdf', 'application/zip': 'zip', 'application/x-zip-compressed': 'zip',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
  'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav',
  'audio/ogg': 'ogg', 'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/flac': 'flac',
  'text/plain': 'txt', 'application/json': 'json',
};
type UploadProof = { path: string; email: string; owner: string; size: number; mime: string; filename: string; exp: number };
type EmailFileInput = { email: string; owner: string; size: number; mime: string; title: string; expiresAt?: number };

function storage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('File email storage is not configured.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
function sign(value: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('File email storage is not configured.');
  return createHmac('sha256', key).update(`exismic-email-file-v1:${value}`).digest('base64url');
}

export function restoreEmailFileUpload(input: EmailFileInput & { path: string; token: string }) {
  const mime = input.mime.split(';')[0].toLowerCase().trim();
  const filename = `${input.title.replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[^a-zA-Z0-9 _-]/g, '').trim().slice(0, 80) || 'Exismic-result'}.${EXTENSIONS[mime]}`;
  if (!EXTENSIONS[mime] || !Number.isSafeInteger(input.size) || input.size <= 0 || input.size > EMAIL_FILE_MAX_BYTES
    || !/^\d{13}_[0-9a-f-]+\.[a-z0-9]+$/.test(input.path) || !input.path.endsWith(`.${EXTENSIONS[mime]}`)
    || !input.token || input.token.length > 1100) throw new Error('Invalid file upload preparation.');
  const exp = input.expiresAt ?? Date.now() + 20 * 60_000;
  if (!Number.isSafeInteger(exp) || exp <= Date.now() || exp > Date.now() + 20 * 60_000) throw new Error('File upload preparation expired.');
  const proof: UploadProof = { path: input.path, email: input.email, owner: input.owner, size: input.size, mime, filename, exp };
  const encoded = Buffer.from(JSON.stringify(proof)).toString('base64url');
  return { bucket: BUCKET, path: input.path, token: input.token, proof: `${encoded}.${sign(encoded)}` };
}

export async function prepareEmailFile(input: EmailFileInput) {
  if (!Number.isSafeInteger(input.size) || input.size <= 0 || input.size > EMAIL_FILE_MAX_BYTES) throw new Error('Email files must be between 1 byte and 20 MB. Download larger files directly instead.');
  const mime = input.mime.split(';')[0].toLowerCase().trim();
  const ext = EXTENSIONS[mime];
  if (!ext) throw new Error('This file format cannot be emailed. Download it directly instead.');
  const path = `${Date.now()}_${randomUUID()}.${ext}`;
  const client = storage();
  const bucket = await client.storage.getBucket(BUCKET);
  if (bucket.error) {
    const created = await client.storage.createBucket(BUCKET, { public: false, fileSizeLimit: EMAIL_FILE_MAX_BYTES, allowedMimeTypes: Object.keys(EXTENSIONS) });
    if (created.error && !/already exists/i.test(created.error.message)) throw new Error('Could not prepare private file storage. Please try again.');
  } else if (bucket.data.public) {
    throw new Error('File email storage must be private.');
  }
  const upload = await client.storage.from(BUCKET).createSignedUploadUrl(path, { upsert: false });
  if (upload.error) throw new Error('Could not prepare the file upload. Please try again.');
  // Delete only expired email exports, never users' library objects. Bounded cleanup on new exports.
  try {
    const old = await client.storage.from(BUCKET).list('', { limit: 100, sortBy: { column: 'name', order: 'asc' } });
    const expired = old.data?.filter(file => /^\d{13}_[0-9a-f-]+\.[a-z0-9]+$/.test(file.name) && Number(file.name.slice(0, 13)) < Date.now() - (LINK_TTL * 1000 + 20 * 60 * 1000)).map(file => file.name) || [];
    if (expired.length) await client.storage.from(BUCKET).remove(expired);
  } catch { /* Cleanup failure must not prevent an export. */ }
  return restoreEmailFileUpload({ ...input, path, token: upload.data.token });
}

export function verifyEmailFileProof(token: string, email: string, owner: string): UploadProof {
  const [encoded, signature, extra] = token.split('.');
  if (!encoded || !signature || extra || token.length > 3000) throw new Error('Invalid file upload. Please select the result again.');
  const expected = Buffer.from(sign(encoded));
  const supplied = Buffer.from(signature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) throw new Error('Invalid file upload.');
  const proof = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as UploadProof;
  if (proof.email !== email || proof.owner !== owner || !Number.isFinite(proof.exp) || proof.exp < Date.now() || !/^\d{13}_[0-9a-f-]+\.[a-z0-9]+$/.test(proof.path) || !EXTENSIONS[proof.mime] || proof.size <= 0 || proof.size > EMAIL_FILE_MAX_BYTES) throw new Error('This upload has expired or belongs to another request. Please try again.');
  return proof;
}

export async function resolveEmailFile(token: string, email: string, owner: string) {
  const proof = verifyEmailFileProof(token, email, owner);
  const client = storage();
  const file = await client.storage.from(BUCKET).download(proof.path);
  if (file.error || !file.data) throw new Error('The file upload is incomplete. Please try again.');
  if (file.data.size !== proof.size || file.data.size > EMAIL_FILE_MAX_BYTES || file.data.type.split(';')[0] !== proof.mime) throw new Error('The uploaded file does not match the selected result.');
  const signed = await client.storage.from(BUCKET).createSignedUrl(proof.path, LINK_TTL, { download: proof.filename });
  if (signed.error || !signed.data.signedUrl) throw new Error('Could not create the download link.');
  return { url: signed.data.signedUrl, expiresAt: new Date(Date.now() + LINK_TTL * 1000).toISOString(), attachment: { filename: proof.filename, content: Buffer.from(await file.data.arrayBuffer()) }, mime: proof.mime };
}
