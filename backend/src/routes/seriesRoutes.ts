import { Router } from "express";
import {
  createSeries,
  getAllSeries,
  getSeriesById,
  deleteSeries,
} from "../controllers/seriesController";
import { createSeason, deleteSeason } from "../controllers/seasonsController";
import { createEpisode, deleteEpisode, getEpisodeById, getVideoUploadUrl, getThumbnailUploadUrl } from "../controllers/episodesController";
import { uploadCover } from "../middlewares/upload";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/", getAllSeries);
router.get("/episodes/:id", getEpisodeById);
router.get("/:id", getSeriesById);
router.post("/", authMiddleware, uploadCover.single("cover"), createSeries);
router.delete("/:id", authMiddleware, deleteSeries);

router.post("/seasons", authMiddleware, createSeason);
router.delete("/seasons/:id", authMiddleware, deleteSeason);

router.post("/episodes/video-upload-url", authMiddleware, getVideoUploadUrl);
router.post("/episodes/thumbnail-upload-url", authMiddleware, getThumbnailUploadUrl);
router.post("/episodes", authMiddleware, createEpisode);
router.delete("/episodes/:id", authMiddleware, deleteEpisode);

export default router;
