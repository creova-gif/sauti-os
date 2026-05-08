import { Router } from "express";
import { db } from "@workspace/db";
import { songsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();
const DEMO_ARTIST_ID = "demo-artist-001";

function mapSong(s: typeof songsTable.$inferSelect) {
  return {
    id: s.id,
    title: s.title,
    isrc: s.isrc,
    genre: s.genre,
    releaseDate: s.releaseDate,
    durationSeconds: s.durationSeconds,
    status: s.status,
    cosotaRef: s.cosotaRef,
    totalStreams: s.totalStreams,
    totalRoyaltiesUsd: Number(s.totalRoyaltiesUsd),
    platforms: s.platforms,
    notes: s.notes,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/songs", async (req, res) => {
  try {
    const songs = await db.select().from(songsTable)
      .where(eq(songsTable.artistId, DEMO_ARTIST_ID))
      .orderBy(desc(songsTable.createdAt));
    res.json(songs.map(mapSong));
  } catch (err) {
    req.log.error({ err }, "Failed to list songs");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/songs", async (req, res) => {
  try {
    const { title, genre, releaseDate, durationSeconds, platforms, notes } = req.body;
    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }
    const [song] = await db.insert(songsTable).values({
      id: randomUUID(),
      artistId: DEMO_ARTIST_ID,
      title,
      genre: genre ?? null,
      releaseDate: releaseDate ?? null,
      durationSeconds: durationSeconds ?? null,
      platforms: platforms ?? [],
      notes: notes ?? null,
      status: "unregistered",
      totalStreams: 0,
      totalRoyaltiesUsd: "0",
    }).returning();
    res.status(201).json(mapSong(song));
  } catch (err) {
    req.log.error({ err }, "Failed to create song");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/songs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, genre, status, platforms, notes } = req.body;
    const [song] = await db.update(songsTable)
      .set({
        ...(title !== undefined && { title }),
        ...(genre !== undefined && { genre }),
        ...(status !== undefined && { status }),
        ...(platforms !== undefined && { platforms }),
        ...(notes !== undefined && { notes }),
      })
      .where(eq(songsTable.id, id))
      .returning();
    if (!song) {
      res.status(404).json({ error: "Song not found" });
      return;
    }
    res.json(mapSong(song));
  } catch (err) {
    req.log.error({ err }, "Failed to update song");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
