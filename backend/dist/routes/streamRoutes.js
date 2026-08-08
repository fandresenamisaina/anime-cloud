"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const streamController_1 = require("../controllers/streamController");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "secret_par_defaut";
// Auth via header OU query param (necessaire pour la balise <video>)
function streamAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const queryToken = req.query.token;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : queryToken;
    if (!token) {
        return res.status(401).json({ message: "Token manquant" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Token invalide ou expire" });
    }
}
const router = (0, express_1.Router)();
router.get("/:id", streamAuthMiddleware, streamController_1.streamEpisode);
exports.default = router;
