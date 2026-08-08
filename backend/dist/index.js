"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const passport_1 = __importDefault(require("./config/passport"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const seriesRoutes_1 = __importDefault(require("./routes/seriesRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const streamRoutes_1 = __importDefault(require("./routes/streamRoutes"));
const watchHistoryRoutes_1 = __importDefault(require("./routes/watchHistoryRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(passport_1.default.initialize());
app.get("/", (req, res) => {
    res.json({ message: "Anime Cloud API en ligne" });
});
app.get("/api/health", async (req, res) => {
    try {
        const result = await db_1.pool.query("SELECT NOW()");
        res.json({ status: "ok", db_time: result.rows[0].now });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Connexion BDD echouee" });
    }
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/series", seriesRoutes_1.default);
app.use("/api/user", userRoutes_1.default);
app.use("/api/stream", streamRoutes_1.default);
app.use("/api/watch-history", watchHistoryRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.get('/health', (req, res) => { res.status(200).send('OK'); });
app.listen(PORT, () => {
    console.log("Serveur backend demarre sur http://localhost:" + PORT);
});
