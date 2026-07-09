alter table "User"
  add column if not exists "bonus_credits" integer not null default 0;

create table if not exists "credit_transactions" (
  "id" text primary key,
  "user_id" text not null references "User"("id") on delete cascade,
  "amount" integer not null,
  "balance_type" text not null,
  "transaction_type" text not null,
  "tool_id" text,
  "description" text,
  "metadata" jsonb,
  "created_at" timestamp(3) not null default current_timestamp
);

create index if not exists "credit_transactions_user_id_created_at_idx"
  on "credit_transactions" ("user_id", "created_at");

create table if not exists "credit_shop_claims" (
  "id" text primary key,
  "user_id" text not null references "User"("id") on delete cascade,
  "claim_date" date not null,
  "rarity" text not null,
  "amount" integer not null,
  "created_at" timestamp(3) not null default current_timestamp,
  constraint "credit_shop_claims_user_id_claim_date_key" unique ("user_id", "claim_date")
);

create index if not exists "credit_shop_claims_user_id_created_at_idx"
  on "credit_shop_claims" ("user_id", "created_at");

update "User"
set "daily_credits" = 500
where lower(coalesce("plan", 'free')) = 'pro'
  and "daily_credits" > 500;

update "User"
set "daily_credits" = 50
where lower(coalesce("plan", 'free')) <> 'pro'
  and "daily_credits" > 50;
