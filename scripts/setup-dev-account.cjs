const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1].trim()] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing supabase URL or service role key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const prisma = new PrismaClient();

async function main() {
  const email = "support@exismic.xyz";
  const password = "@YASEERRAYANrx1";

  console.log(`Setting up dev account: ${email}...`);

  // 1. Check or create in Supabase Auth
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError);
    return;
  }

  let existing = listData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  let userId;

  if (existing) {
    console.log("User exists in Supabase Auth. Updating password and email confirmation...");
    userId = existing.id;
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "Exismic Dev",
        name: "Exismic Dev",
      }
    });
    if (updateError) {
      console.error("Failed to update user in Supabase:", updateError);
      return;
    }
    console.log("Updated user in Supabase Auth successfully.");
  } else {
    console.log("Creating user in Supabase Auth...");
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "Exismic Dev",
        name: "Exismic Dev",
      }
    });
    if (createError) {
      console.error("Failed to create user in Supabase Auth:", createError);
      return;
    }
    userId = createData.user.id;
    console.log("Created user in Supabase Auth with ID:", userId);
  }

  // 2. Check or upsert in Prisma DB
  console.log("Upserting user in database with infinite credits, sparks & Pro membership...");
  const dbUser = await prisma.user.upsert({
    where: { email },
    update: {
      id: userId,
      name: "Exismic Dev",
      plan: "pro",
      subscriptionStatus: "active",
      role: "developer",
      dailyCredits: 99999999,
      bonusCredits: 99999999,
      lifetimeCredits: 99999999,
      sparks: 99999999,
      lifetimeSparks: 99999999,
      status: "active",
      emailVerified: new Date(),
      planExpiresAt: null,
      aiGenerationsLimit: 99999999,
    },
    create: {
      id: userId,
      email,
      name: "Exismic Dev",
      plan: "pro",
      subscriptionStatus: "active",
      role: "developer",
      dailyCredits: 99999999,
      bonusCredits: 99999999,
      lifetimeCredits: 99999999,
      sparks: 99999999,
      lifetimeSparks: 99999999,
      status: "active",
      emailVerified: new Date(),
      planExpiresAt: null,
      aiGenerationsLimit: 99999999,
    }
  });

  console.log("Database user setup complete:", dbUser.id, dbUser.email, "plan:", dbUser.plan, "credits:", dbUser.lifetimeCredits);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
