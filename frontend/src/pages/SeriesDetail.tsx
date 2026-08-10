const handleAddEpisode = async (e: React.FormEvent) => {
  e.preventDefault();
  setEpError("");
  if (!uploadSeasonId || !epFile) {
    setEpError("Fichier video et saison obligatoires");
    return;
  }
  setEpUploading(true);
  try {
    console.log("1. Lecture duree locale...");
    const durationSeconds = await getVideoDurationLocally(epFile);
    console.log("1. OK, duree =", durationSeconds);

    console.log("2. Demande URL signee video...");
    const videoUrlRes = await api.post("/series/episodes/video-upload-url", {
      filename: epFile.name,
    });
    console.log("2. OK, reponse =", videoUrlRes.data);
    const { signedUrl: videoSignedUrl, publicUrl: videoPublicUrl } = videoUrlRes.data;

    console.log("3. Upload video vers Supabase...");
    const uploadRes = await fetch(videoSignedUrl, {
      method: "PUT",
      headers: { "Content-Type": epFile.type },
      body: epFile,
    });
    console.log("3. OK, statut =", uploadRes.status);

    let thumbnailPublicUrl: string | null = null;

    if (epThumbnailFile) {
      console.log("4. Demande URL signee miniature...");
      const thumbUrlRes = await api.post("/series/episodes/thumbnail-upload-url", {
        filename: epThumbnailFile.name,
      });
      console.log("4. OK, reponse =", thumbUrlRes.data);
      const { signedUrl: thumbSignedUrl, publicUrl: thumbPublicUrl } = thumbUrlRes.data;

      console.log("5. Upload miniature vers Supabase...");
      const thumbUploadRes = await fetch(thumbSignedUrl, {
        method: "PUT",
        headers: { "Content-Type": epThumbnailFile.type },
        body: epThumbnailFile,
      });
      console.log("5. OK, statut =", thumbUploadRes.status);

      thumbnailPublicUrl = thumbPublicUrl;
    }

    console.log("6. Creation episode en base...");
    await api.post("/series/episodes", {
      season_id: uploadSeasonId,
      episode_number: epNumber,
      title: epTitle || undefined,
      video_url: videoPublicUrl,
      thumbnail_url: thumbnailPublicUrl,
      duration_seconds: durationSeconds,
    });
    console.log("6. OK, episode cree !");

    setEpNumber("");
    setEpTitle("");
    setEpFile(null);
    setEpSubtitleFile(null);
    setEpThumbnailFile(null);
    setUploadSeasonId(null);
    fetchSeries();
  } catch (err: any) {
    console.error("ERREUR a l etape en cours:", err);
    setEpError(err.response?.data?.message || "Erreur lors de l upload");
  } finally {
    setEpUploading(false);
  }
};