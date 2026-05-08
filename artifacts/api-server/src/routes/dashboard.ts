import { Router } from "express";
import { db } from "@workspace/db";
import {
  artistsTable, songsTable, royaltyTransactionsTable,
  contractsTable, eventsTable, airplayDetectionsTable
} from "@workspace/db";
import { eq, and, gte } from "drizzle-orm";

const router = Router();
const DEMO_ARTIST_ID = "demo-artist-001";

router.get("/dashboard/summary", async (req, res) => {
  try {
    const [artist] = await db.select().from(artistsTable).where(eq(artistsTable.id, DEMO_ARTIST_ID)).limit(1);
    const songs = await db.select().from(songsTable).where(eq(songsTable.artistId, DEMO_ARTIST_ID));
    const contracts = await db.select().from(contractsTable).where(eq(contractsTable.artistId, DEMO_ARTIST_ID));
    const events = await db.select().from(eventsTable).where(eq(eventsTable.artistId, DEMO_ARTIST_ID));
    const airplay = await db.select().from(airplayDetectionsTable).where(eq(airplayDetectionsTable.artistId, DEMO_ARTIST_ID));

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthlyTxs = await db.select().from(royaltyTransactionsTable)
      .where(and(
        eq(royaltyTransactionsTable.artistId, DEMO_ARTIST_ID),
        gte(royaltyTransactionsTable.createdAt, new Date(thisMonthStart))
      ));

    const totalStreams = songs.reduce((s, song) => s + song.totalStreams, 0);
    const totalRoyaltiesUsd = songs.reduce((s, song) => s + Number(song.totalRoyaltiesUsd), 0);
    const pendingCosotaCount = songs.filter(s => s.status === "pending_cosota").length;
    const unregisteredCount = songs.filter(s => s.status === "unregistered").length;
    const activeContracts = contracts.filter(c => c.status === "active").length;
    const pendingContractValue = contracts
      .filter(c => c.status === "pending_signature")
      .reduce((s, c) => s + Number(c.valueUsd ?? 0), 0);
    const upcomingEvents = events.filter(e => e.status === "on_sale" || e.status === "draft").length;
    const uncollectedAirplay = airplay.filter(a => !a.claimed).length;
    const totalEarningsThisMonth = monthlyTxs
      .filter(t => t.transactionType !== "withdrawal" && Number(t.amountUsd) > 0)
      .reduce((s, t) => s + Number(t.amountUsd), 0);

    res.json({
      walletBalanceUsd: artist ? Number(artist.walletBalanceUsd) : 0,
      walletBalanceTzs: artist ? Number(artist.walletBalanceTzs) : 0,
      totalStreams,
      totalRoyaltiesUsd,
      pendingCosotaCount,
      unregisteredCount,
      totalSongs: songs.length,
      activeContracts,
      pendingContractValue,
      upcomingEvents,
      uncollectedAirplay,
      totalEarningsThisMonth,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/earnings-chart", async (req, res) => {
  try {
    // Return last 6 months of grouped streaming earnings
    const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const data = [
      { month: "Oct", earned: 42, streams: 68000 },
      { month: "Nov", earned: 68, streams: 95000 },
      { month: "Dec", earned: 91, streams: 132000 },
      { month: "Jan", earned: 78, streams: 112000 },
      { month: "Feb", earned: 110, streams: 155000 },
      { month: "Mar", earned: 119, streams: 168000 },
    ];
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to get earnings chart");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/platform-breakdown", async (req, res) => {
  try {
    const data = [
      { name: "Spotify", amount: 245.30, streams: 520000, color: "#1DB954" },
      { name: "Boomplay", amount: 98.50, streams: 180000, color: "#FF6B35" },
      { name: "Apple Music", amount: 87.20, streams: 95000, color: "#FA243C" },
      { name: "Audiomack", amount: 52.40, streams: 40000, color: "#F9A825" },
      { name: "YouTube", amount: 25.00, streams: 12320, color: "#FF0000" },
    ];
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to get platform breakdown");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
