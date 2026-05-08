import { Router } from "express";
import { db } from "@workspace/db";
import { artistsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const DEMO_ARTIST_ID = "demo-artist-001";

router.get("/me", async (req, res) => {
  try {
    const artist = await db.select().from(artistsTable).where(eq(artistsTable.id, DEMO_ARTIST_ID)).limit(1);
    if (!artist[0]) {
      res.status(404).json({ error: "Artist not found" });
      return;
    }
    const a = artist[0];
    res.json({
      id: a.id,
      stageName: a.stageName,
      legalName: a.legalName,
      email: a.email,
      phone: a.phone,
      genre: a.genre,
      bio: a.bio,
      locationCountry: a.locationCountry,
      locationCity: a.locationCity,
      tier: a.tier,
      cosotaMemberId: a.cosotaMemberId,
      walletBalanceUsd: Number(a.walletBalanceUsd),
      walletBalanceTzs: Number(a.walletBalanceTzs),
      isActive: a.isActive,
      createdAt: a.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get artist");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
