import { Router } from "express";
import passport from "../config/passport";
import { register, login, getMe, updateAvatar, googleCallback } from "../controllers/authController";
import { uploadAvatar } from "../middlewares/upload";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/register", uploadAvatar.single("avatar"), register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.put("/me/avatar", authMiddleware, uploadAvatar.single("avatar"), updateAvatar);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleCallback
);

export default router;
