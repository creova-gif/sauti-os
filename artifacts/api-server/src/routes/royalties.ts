import { Router } from "express";
import { db } from "@workspace/db";
import { royaltyTransactionsTable, artistsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();
const DEMO_ARTIST_ID = "demo-artist-001";

function mapTx(t: typeof royaltyTransactionsTable.$inferSelect) {
  return {
    id: t.id,
    transactionType: t.transactionType,
    platform: t.platform,
    amountUsd: Number(t.amountUsd),
    amountTzs: t.amountTzs !== null ? Number(t.amountTzs) : null,
    feeUsd: Number(t.feeUsd),
    netUsd: Number(t.netUsd),
    status: t.status,
    reference: t.reference,
    description: t.description,
    periodStart: t.periodStart,
    periodEnd: t.periodEnd,
    createdAt: t.createdAt.toISOString(),
  };
}

router.get("/royalties", async (req, res) => {
  try {
    const txs = await db.select().from(royaltyTransactionsTable)
      .where(eq(royaltyTransactionsTable.artistId, DEMO_ARTIST_ID))
      .orderBy(desc(royaltyTransactionsTable.createdAt));
    res.json(txs.map(mapTx));
  } catch (err) {
    req.log.error({ err }, "Failed to list royalties");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/royalties/withdraw", async (req, res) => {
  try {
    const { amountUsd, mpesaNumber } = req.body;
    if (!amountUsd || !mpesaNumber) {
      res.status(400).json({ error: "amountUsd and mpesaNumber are required" });
      return;
    }
    const fee = parseFloat((amountUsd * 0.015).toFixed(2));
    const net = parseFloat((amountUsd + fee).toFixed(2));
    const tzs = parseFloat((amountUsd * 2580).toFixed(2));

    const [tx] = await db.insert(royaltyTransactionsTable).values({
      id: randomUUID(),
      artistId: DEMO_ARTIST_ID,
      transactionType: "withdrawal",
      platform: "M-Pesa",
      amountUsd: (-amountUsd).toString(),
      amountTzs: (-tzs).toString(),
      feeUsd: fee.toString(),
      netUsd: (-net).toString(),
      status: "processing",
      reference: `MPESA-${Date.now()}`,
      description: `Withdrawal to M-Pesa ${mpesaNumber}`,
    }).returning();

    // Deduct from wallet
    const artist = await db.select().from(artistsTable).where(eq(artistsTable.id, DEMO_ARTIST_ID)).limit(1);
    if (artist[0]) {
      const newBalance = Math.max(0, Number(artist[0].walletBalanceUsd) - amountUsd);
      await db.update(artistsTable).set({ walletBalanceUsd: newBalance.toString() }).where(eq(artistsTable.id, DEMO_ARTIST_ID));
    }

    res.status(201).json(mapTx(tx));
  } catch (err) {
    req.log.error({ err }, "Failed to create withdrawal");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
