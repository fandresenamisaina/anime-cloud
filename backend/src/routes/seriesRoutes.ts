import { Router } from "express";
import {
  createSeries,
  getAllSeries,
  getSeriesById,
  deleteSeries,
} from "../controllers/seriesController";
import { createSeason, deleteSeason } from "../controllers/seasonsController";
import { createEpisode, deleteEpisode, getEpisodeById } from "../controllers/episodesController";
import { uploadCover, uploadEpisodeFiles } from "../middlewares/upload";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/", getAllSeries);
router.get("/episodes/:id", getEpisodeById);
router.get("/:id", getSeriesById);
router.post("/", authMiddleware, uploadCover.single("cover"), createSeries);
router.delete("/:id", authMiddleware, deleteSeries);

router.post("/seasons", authMiddleware, createSeason);
router.delete("/seasons/:id", authMiddleware, deleteSeason);

router.post(
  "/episodes",
  authMiddleware,
  uploadEpisodeFiles.fields([
    { name: "video", maxCount: 1 },
    { name: "subtitle", maxCount: 1 },
  ]),
  createEpisode
);
router.delete("/episodes/:id", authMiddleware, deleteEpisode);

export default router;
