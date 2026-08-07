import multer from "multer";
import { Request } from "express";

const storage = multer.memoryStorage();

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Seules les images sont autorisees"));
    }
  },
});

export const uploadCover = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Seules les images sont autorisees"));
    }
  },
});

export const uploadVideo = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Seules les videos sont autorisees"));
    }
  },
});

export const uploadEpisodeFiles = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.fieldname === "video") {
      if (file.mimetype.startsWith("video/")) {
        cb(null, true);
      } else {
        cb(new Error("Le champ video doit etre un fichier video"));
      }
    } else if (file.fieldname === "subtitle") {
      if (file.originalname.toLowerCase().endsWith(".srt")) {
        cb(null, true);
      } else {
        cb(new Error("Le sous-titre doit etre un fichier .srt"));
      }
    } else {
      cb(new Error("Champ de fichier inconnu"));
    }
  },
});
