const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const prisma = new PrismaClient();

async function grantAdmin(email) {
  const targetEmail = email.toLowerCase().trim();
  console.log(`🚀 Granting admin access to: ${targetEmail}`);

  try {
    // 1. Update local / Supabase Postgres via Prisma
    const existingUser = await prisma.user.findFirst({
      where: { email: targetEmail }
    });

    if (existingUser) {
      const updatedPrismaUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: 'admin',
          plan: 'pro',
          dailyCredits: 1000,
          aiGenerationsLimit: 1000
        }
      });
      console.log(`✅ Updated existing Prisma user record (${updatedPrismaUser.id}) to role='admin'.`);
    } else {
      console.log(`ℹ️ No existing user found in Prisma DB with email ${targetEmail}. Role will apply via ADMIN_EMAILS configuration and user access utilities.`);
    }

    // 2. Update Supabase public.User table if present
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await supabase
        .from('User')
        .update({
          role: 'admin',
          plan: 'pro',
          planType: 'pro',
          plan_type: 'pro',
          daily_credits: 1000,
          ai_generations_limit: 1000,
          updated_at: new Date().toISOString()
        })
        .eq('email', targetEmail);

      if (error) {
        console.error("⚠️ Supabase User table update note:", error.message);
      } else {
        console.log("✅ Updated Supabase User table.");
      }
    }

    console.log(`\n🎉 Admin access successfully granted to ${targetEmail}!`);
  } catch (err) {
    console.error("❌ Error granting admin access:", err);
  } finally {
    await prisma.$disconnect();
  }
}

const target = process.argv[2] || 'syedrayan.dev@gmail.com';
grantAdmin(target);
