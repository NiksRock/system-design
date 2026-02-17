import { z } from 'zod';
export declare const baseEnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodEnum<{
        development: "development";
        production: "production";
        test: "test";
    }>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DATABASE_URL: z.ZodString;
    GOOGLE_CLIENT_ID: z.ZodString;
    GOOGLE_CLIENT_SECRET: z.ZodString;
    JWT_SECRET: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=index.d.ts.map