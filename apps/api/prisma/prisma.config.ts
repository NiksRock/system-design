// prisma/prisma.config.ts
import { defineConfig, env } from 'prisma/config';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default defineConfig({
  // Fix: change './prisma/schema.prisma' to './schema.prisma'
  schema: './schema.prisma',
  datasource: {
    url: env('DATABASE_URL') || process.env.DATABASE_URL,
  },
});
