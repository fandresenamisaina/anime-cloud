import { Router } from "express";
import {
  getAllUsers,
  deleteUser,
  toggleUserAdmin,
  getAllSeriesAdmin,
  adminDeleteSeries,
  adminDeleteEpisode,
  getStats,
  getStorageStats,
} from "../controllers/adminController";
import { authMiddleware } from "../middlewares/auth";
import { adminMiddleware } from "../middlewares/admin";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/toggle-admin", toggleUserAdmin);
router.get("/series", getAllSeriesAdmin);
router.delete("/series/:id", adminDeleteSeries);
router.delete("/episodes/:id", adminDeleteEpisode);
router.get("/stats", getStats);
router.get("/storage", getStorageStats);

export default router;
