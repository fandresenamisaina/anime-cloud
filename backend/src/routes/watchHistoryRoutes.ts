import { Router } from "express";
import { upsertProgress, getProgress, getContinueWatching } from "../controllers/watchHistoryController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/", authMiddleware, upsertProgress);
router.get("/continue-watching", authMiddleware, getContinueWatching);
router.get("/:episode_id", authMiddleware, getProgress);

export default router;
