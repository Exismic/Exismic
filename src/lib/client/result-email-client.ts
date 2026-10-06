export type ResultEmailAllowance = { tier: 'guest' | 'free' | 'pro'; limit: number; used: number; reserved: number; remaining: number; resetsAt: string };
type Input = { email: string; toolType: string; toolName: string; title: string; content?: string; fileUrl?: string; metadata?: Record<string, unknown>; owner?: string | null };
type Upload = { bucket: string; path: string; token: string; proof: string };
type ResponseBody = { success?: boolean; pending?: boolean; message?: string; error?: string; restartRequest?: boolean; quota?: ResultEmailAllowance; upload?: Upload };
type Attempt = { signature: string; requestId: string; blob?: Blob; digest?: string; upload?: Upload; uploaded?: boolean };

/** Keep the request and upload identity after a lost response; the server owns the allowance. */
export class ResultEmailClient {
  private attempt?: Attempt;
  async send(input: Input, uploadFile: (upload: Upload, blob: Blob) => Promise<{ error?: { message?: string } | null }>): Promise<ResponseBody> {
    const signature = JSON.stringify([input.owner, input.email.trim().toLowerCase(), input.toolType, input.toolName, input.title, input.content, input.fileUrl]);
    if (this.attempt?.signature !== signature) this.attempt = { signature, requestId: crypto.randomUUID() };
    const attempt = this.attempt!;
    const localFile = input.fileUrl?.startsWith('blob:') || input.fileUrl?.startsWith('data:');
    if (localFile && !attempt.blob) {
      const response = await fetch(input.fileUrl!);
      const blob = await response.blob();
      if (!response.ok || !blob.size || blob.size > 20 * 1024 * 1024) throw new Error('Email supports files up to 20 MB. Please download larger files directly.');
      const hash = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
      attempt.digest = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
      attempt.blob = blob;
    }
    const payload = {
      requestId: attempt.requestId, email: input.email.trim(), toolType: input.toolType, toolName: input.toolName,
      title: input.title, content: input.content, metadata: input.metadata,
      fileUrl: localFile ? undefined : input.fileUrl,
      ...(attempt.blob ? { fileSize: attempt.blob.size, fileMime: attempt.blob.type, fileDigest: attempt.digest } : {}),
    };
    const post = async (body: object) => {
      const response = await fetch('/api/tools/email-result', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json() as ResponseBody;
      if (data.restartRequest) this.attempt = undefined;
      return data;
    };
    if (attempt.blob) {
      if (!attempt.upload) {
        const prepared = await post({ ...payload, action: 'prepare-upload' });
        if (!prepared.upload) return prepared;
        attempt.upload = prepared.upload;
      }
      if (!attempt.uploaded) {
        const result = await uploadFile(attempt.upload, attempt.blob);
        // The response to the previous upload may have been lost. The server verifies its bytes.
        if (result.error && !/already exists|duplicate/i.test(result.error.message || '')) throw new Error('Could not upload the result file. Please try again.');
        attempt.uploaded = true;
      }
    }
    return post({ ...payload, fileProof: attempt.upload?.proof });
  }
}
