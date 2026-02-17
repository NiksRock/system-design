import { z } from "zod";

export const baseEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().default(3002),

  DATABASE_URL: z.string().url(),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string().url(),

  FRONTEND_URL: z.string().url(),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("1d"),
  ENCRYPTION_KEY: z.string().length(64),
  REDIS_URL: z.string().url(),
});
