"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadEpisodeFiles = exports.uploadVideo = exports.uploadCover = exports.uploadAvatar = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
exports.uploadAvatar = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Seules les images sont autorisees"));
        }
    },
});
exports.uploadCover = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Seules les images sont autorisees"));
        }
    },
});
exports.uploadVideo = (0, multer_1.default)({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("video/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Seules les videos sont autorisees"));
        }
    },
});
exports.uploadEpisodeFiles = (0, multer_1.default)({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "video") {
            if (file.mimetype.startsWith("video/")) {
                cb(null, true);
            }
            else {
                cb(new Error("Le champ video doit etre un fichier video"));
            }
        }
        else if (file.fieldname === "subtitle") {
            if (file.originalname.toLowerCase().endsWith(".srt")) {
                cb(null, true);
            }
            else {
                cb(new Error("Le sous-titre doit etre un fichier .srt"));
            }
        }
        else {
            cb(new Error("Champ de fichier inconnu"));
        }
    },
});
