import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Perfil de usuário (espelho da tabela pública em Supabase)
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(), // geralmente UUID do usuário do auth
  email: text("email"),
  fullName: text("full_name"),
  createdAt: timestamp("created_at", { withTimezone: true }),
});