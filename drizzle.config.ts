import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" }); // use ".env.local" se preferir no Next

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});