import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  updateWatchProgress,
  getWatchHistory,
} from "../controllers/userController";

const router = Router();

router.use(authMiddleware);

router.get("/favorites", getFavorites);
router.post("/favorites", addFavorite);
router.delete("/favorites/:series_id", removeFavorite);

router.get("/watchlist", getWatchlist);
router.post("/watchlist", addToWatchlist);
router.delete("/watchlist/:series_id", removeFromWatchlist);

router.get("/history", getWatchHistory);
router.post("/history", updateWatchProgress);

export default router;
