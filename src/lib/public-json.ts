import { NextResponse } from 'next/server';
import { publicErrorPayload } from './public-errors';

/** Successful payloads/status/headers stay intact; public errors are safe to display. */
export function publicJson<T>(body: T, init?: Parameters<typeof NextResponse.json>[1]): NextResponse<T> {
  return NextResponse.json(publicErrorPayload(body, init?.status || 200), init);
}
