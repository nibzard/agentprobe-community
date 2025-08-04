import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  // Use local D1 for development, remote for production
  ...(process.env.NODE_ENV === 'production' ? {
    driver: 'd1-http',
    dbCredentials: {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
      databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID!,
      token: process.env.CLOUDFLARE_API_TOKEN!,
    },
  } : {
    // Local development using wrangler d1
    driver: 'better-sqlite3',
    dbCredentials: {
      url: './.wrangler/state/v3/d1/miniflare-D1DatabaseObject/agentprobe-community.sqlite',
    },
  }),
});