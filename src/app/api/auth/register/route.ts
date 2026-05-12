import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/register
 * Real registration API that hashes passwords and creates users in Supabase.
 */
export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create user
    // We generate a unique ID (random string) to match NextAuth's expected format
    const userId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        dailyCredits: 50,
        plan: 'free',
        creditsLastReset: new Date(),
      },
    });

    // Note: The 'events.createUser' in src/auth.ts will catch this if it's triggered via NextAuth,
    // but since we are manually creating the user here, we should trigger the welcome email manually.
    try {
        const { sendWelcomeEmail } = await import("@/lib/emails");
        await sendWelcomeEmail(email);
    } catch (emailError) {
        console.error("Failed to send welcome email during manual registration:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });

  } catch (error: any) {
    console.error('Registration failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
