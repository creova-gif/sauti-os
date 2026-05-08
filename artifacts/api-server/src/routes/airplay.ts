import { Router } from "express";
import { db } from "@workspace/db";
import { airplayDetectionsTable, songsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();
const DEMO_ARTIST_ID = "demo-artist-001";

router.get("/airplay", async (req, res) => {
  try {
    const detections = await db.select({
      detection: airplayDetectionsTable,
      songTitle: songsTable.title,
    })
      .from(airplayDetectionsTable)
      .leftJoin(songsTable, eq(airplayDetectionsTable.songId, songsTable.id))
      .where(eq(airplayDetectionsTable.artistId, DEMO_ARTIST_ID))
      .orderBy(desc(airplayDetectionsTable.detectedAt));

    res.json(detections.map(({ detection: d, songTitle }) => ({
      id: d.id,
      songId: d.songId,
      songTitle: songTitle ?? "Unknown",
      stationName: d.stationName,
      stationType: d.stationType,
      country: d.country,
      detectedAt: d.detectedAt.toISOString(),
      durationSeconds: d.durationSeconds,
      claimed: d.claimed,
      cosotaClaimRef: d.cosotaClaimRef,
      createdAt: d.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list airplay");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/airplay/:id/claim", async (req, res) => {
  try {
    const { id } = req.params;
    const claimRef = `CLM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const [detection] = await db.update(airplayDetectionsTable)
      .set({ claimed: true, cosotaClaimRef: claimRef })
      .where(eq(airplayDetectionsTable.id, id))
      .returning();
    if (!detection) {
      res.status(404).json({ error: "Airplay detection not found" });
      return;
    }
    const [song] = await db.select().from(songsTable).where(eq(songsTable.id, detection.songId)).limit(1);
    res.json({
      id: detection.id,
      songId: detection.songId,
      songTitle: song?.title ?? "Unknown",
      stationName: detection.stationName,
      stationType: detection.stationType,
      country: detection.country,
      detectedAt: detection.detectedAt.toISOString(),
      durationSeconds: detection.durationSeconds,
      claimed: detection.claimed,
      cosotaClaimRef: detection.cosotaClaimRef,
      createdAt: detection.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to claim airplay");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
