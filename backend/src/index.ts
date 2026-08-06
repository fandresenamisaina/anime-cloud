import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db";
import authRoutes from "./routes/authRoutes";
import seriesRoutes from "./routes/seriesRoutes";
import userRoutes from "./routes/userRoutes";
import streamRoutes from "./routes/streamRoutes";
import watchHistoryRoutes from "./routes/watchHistoryRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Anime Cloud API en ligne" });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", db_time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Connexion BDD echouee" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/series", seriesRoutes);
app.use("/api/user", userRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/watch-history", watchHistoryRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log("Serveur backend demarre sur http://localhost:" + PORT);
});
