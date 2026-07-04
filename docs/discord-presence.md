# Official Discord Presence

The Discord card generator can read live status and activities without requiring
users to join Lanyard. It uses a small Discord Gateway worker and Redis.

## Discord application

1. Create or reuse a Discord application in the Discord Developer Portal.
2. Create its bot user.
3. Under **Bot > Privileged Gateway Intents**, enable **Presence Intent** and
   **Server Members Intent**.
4. Invite the bot to the Discord server used for presence sharing.
5. Users whose live presence should appear must share a server with the bot.

The bot does not need administrator or message permissions.

## Environment

Configure these values for both the Next.js app and the worker:

```env
DISCORD_BOT_TOKEN=your_bot_token
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_DISCORD_PRESENCE_INVITE_URL=https://discord.gg/your-server
```

Never expose `DISCORD_BOT_TOKEN` in a `NEXT_PUBLIC_` variable.

## Run

Start the web app:

```bash
npm run dev
```

Start the persistent Gateway worker in a second process:

```bash
npm run discord:presence
```

Production deployments must run the worker on a persistent Node.js service.
Vercel functions cannot hold a permanent Discord Gateway connection, so the
worker should run on a worker/container host while both services use the same
Redis database.

## Data flow

1. Opening a Discord card registers that Discord user ID in Redis.
2. The Gateway worker receives `PRESENCE_UPDATE` events for shared guilds.
3. Presence snapshots are saved in Redis with a six-hour expiry.
4. The card API checks Toolverse presence first.
5. Lanyard is used only as a fallback while the official worker is unavailable.
