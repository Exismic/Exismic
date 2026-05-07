import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    
    // Generate a strong 16-character password by default
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return NextResponse.json({ 
      success: true, 
      result: password 
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Failed to generate password" }, { status: 500 });
  }
}
