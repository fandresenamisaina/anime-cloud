import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
pool.on("connect", () => {
  console.log("✅ Connecté à PostgreSQL");
});
pool.on("error", (err: Error) => {
  console.error("❌ Erreur PostgreSQL :", err);
});