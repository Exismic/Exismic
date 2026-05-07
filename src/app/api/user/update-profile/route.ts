import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, username } = await req.json();

    // 1. Basic Validation
    if (username && (username.length < 3 || username.length > 20)) {
      return NextResponse.json({ error: "Username must be between 3 and 20 characters." }, { status: 400 });
    }

    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: "Username can only contain letters, numbers, and underscores." }, { status: 400 });
    }

    // 2. Groq Profanity Check
    if (username) {
      const groqKey = process.env.GROQ_API_KEY;
      try {
        const groqRes = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
          model: "llama-3.3-70b-versatile",
          messages: [
            { 
              role: "system", 
              content: "You are a strict content moderator for a premium creative platform. Analyze the username provided. If it contains profanity, sexual slurs, hate speech, or offensive terms (including the N-word, sexual references, etc.), respond with 'INVALID: [Brief Reason]'. Otherwise, respond with 'VALID'. Be very strict. No fluff." 
            },
            { role: "user", content: username }
          ],
          temperature: 0
        }, {
          headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" }
        });

        const result = groqRes.data.choices[0].message.content.trim();
        if (result.startsWith("INVALID")) {
          return NextResponse.json({ error: result.replace("INVALID:", "").trim() }, { status: 400 });
        }
      } catch (e) {
        console.error("Groq Validation Error:", e);
        // Fallback to basic check if Groq fails
      }
    }

    // 3. Uniqueness Check & Suggestions
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser && existingUser.email !== session.user.email) {
        // Suggest alternatives
        const suggestions = [
          `${username}${Math.floor(Math.random() * 999)}`,
          `${username}_pro`,
          `${username}_${new Date().getFullYear()}`
        ];
        return NextResponse.json({ 
          error: "Username already taken.", 
          suggestions 
        }, { status: 409 });
      }
    }

    // 4. Update Database
    const updateData: any = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;

    const updatedUser = await prisma.user.upsert({
      where: { email: session.user.email },
      update: updateData,
      create: {
        email: session.user.email,
        ...updateData,
        credits: 20, // default credits for new users
        plan: "free"
      }
    });

    // 5. Update Supabase Auth Metadata (for name)
    if (name) {
      await supabase.auth.updateUser({
        data: { full_name: name }
      });
    }

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });

  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
