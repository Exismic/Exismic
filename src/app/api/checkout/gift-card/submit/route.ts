import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Third-party gift-card payments are no longer accepted. Please use the secure checkout or an Exismic gift voucher." }, { status: 410 });
}
