const ffmpegPath = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const input = process.argv[2];
const output = process.argv[3];

console.log("Debut de la conversion...");

ffmpeg(input)
  .outputOptions(["-c copy", "-movflags +faststart"])
  .on("end", () => {
    console.log("Termine avec succes:", output);
  })
  .on("error", (err) => {
    console.error("Erreur:", err.message);
  })
  .save(output);
