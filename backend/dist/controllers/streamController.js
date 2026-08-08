"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamEpisode = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const db_1 = require("../config/db");
const minio_1 = require("../config/minio");
function extractKeyFromUrl(videoUrl, bucket) {
    const marker = `/${bucket}/`;
    const index = videoUrl.indexOf(marker);
    return videoUrl.substring(index + marker.length);
}
const streamEpisode = async (req, res) => {
    try {
        const { id } = req.params;
        const episodeResult = await db_1.pool.query("SELECT * FROM episodes WHERE id = $1", [id]);
        if (episodeResult.rows.length === 0) {
            return res.status(404).json({ message: "Episode introuvable" });
        }
        const episode = episodeResult.rows[0];
        const key = extractKeyFromUrl(episode.video_url, minio_1.BUCKET_VIDEOS);
        const headResult = await minio_1.s3Client.send(new client_s3_1.HeadObjectCommand({ Bucket: minio_1.BUCKET_VIDEOS, Key: key }));
        const fileSize = headResult.ContentLength || 0;
        const contentType = headResult.ContentType || "video/mp4";
        const range = req.headers.range;
        if (!range) {
            const objectResult = await minio_1.s3Client.send(new client_s3_1.GetObjectCommand({ Bucket: minio_1.BUCKET_VIDEOS, Key: key }));
            res.writeHead(200, {
                "Content-Length": fileSize,
                "Content-Type": contentType,
                "Accept-Ranges": "bytes",
            });
            objectResult.Body.pipe(res);
            return;
        }
        const matches = range.match(/bytes=(\d*)-(\d*)/);
        let start;
        let end;
        if (matches && matches[1] !== "") {
            start = parseInt(matches[1], 10);
            end = matches[2] !== "" ? parseInt(matches[2], 10) : fileSize - 1;
        }
        else if (matches && matches[2] !== "") {
            const suffixLength = parseInt(matches[2], 10);
            start = Math.max(fileSize - suffixLength, 0);
            end = fileSize - 1;
        }
        else {
            start = 0;
            end = fileSize - 1;
        }
        if (end >= fileSize)
            end = fileSize - 1;
        if (start > end)
            start = end;
        const chunkSize = end - start + 1;
        const objectResult = await minio_1.s3Client.send(new client_s3_1.GetObjectCommand({
            Bucket: minio_1.BUCKET_VIDEOS,
            Key: key,
            Range: `bytes=${start}-${end}`,
        }));
        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": contentType,
        });
        objectResult.Body.pipe(res);
    }
    catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).json({ message: "Erreur lors du streaming de la video" });
        }
    }
};
exports.streamEpisode = streamEpisode;
