import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn('[Email] RESEND_API_KEY is not configured. Email sends will fail until it is set.');
}

export const resend = new Resend(apiKey || 'missing_resend_api_key');
