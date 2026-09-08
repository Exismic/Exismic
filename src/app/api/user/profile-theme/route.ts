import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: "Profile themes have been discontinued." },
    { status: 410 }
  );
}
