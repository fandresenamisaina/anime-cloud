"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("../config/passport"));
const authController_1 = require("../controllers/authController");
const upload_1 = require("../middlewares/upload");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post("/register", upload_1.uploadAvatar.single("avatar"), authController_1.register);
router.post("/login", authController_1.login);
router.get("/me", auth_1.authMiddleware, authController_1.getMe);
router.put("/me/avatar", auth_1.authMiddleware, upload_1.uploadAvatar.single("avatar"), authController_1.updateAvatar);
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", passport_1.default.authenticate("google", { session: false, failureRedirect: "/login" }), authController_1.googleCallback);
exports.default = router;
