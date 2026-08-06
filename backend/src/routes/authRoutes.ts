import { Router } from "express";
import { register, login, getMe, updateAvatar } from "../controllers/authController";
import { uploadAvatar } from "../middlewares/upload";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/register", uploadAvatar.single("avatar"), register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.put("/me/avatar", authMiddleware, uploadAvatar.single("avatar"), updateAvatar);

export default router;