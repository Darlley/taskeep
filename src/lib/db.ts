import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Conexão direta com o Postgres via Connection Pooler do Supabase
// Defina DATABASE_URL em .env.local com a URI do "Shared Pooler"
const connectionString = process.env.DATABASE_URL as string;

// Desabilita prefetch pois não é suportado no modo "Transaction" do pooler
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);