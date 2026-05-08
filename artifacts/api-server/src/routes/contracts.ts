import { Router } from "express";
import { db } from "@workspace/db";
import { contractsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();
const DEMO_ARTIST_ID = "demo-artist-001";

function mapContract(c: typeof contractsTable.$inferSelect) {
  return {
    id: c.id,
    contractType: c.contractType,
    title: c.title,
    counterparty: c.counterparty,
    counterpartyEmail: c.counterpartyEmail,
    valueUsd: c.valueUsd !== null ? Number(c.valueUsd) : null,
    currency: c.currency,
    status: c.status,
    signedDate: c.signedDate,
    startDate: c.startDate,
    endDate: c.endDate,
    termsText: c.termsText,
    notes: c.notes,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/contracts", async (req, res) => {
  try {
    const contracts = await db.select().from(contractsTable)
      .where(eq(contractsTable.artistId, DEMO_ARTIST_ID))
      .orderBy(desc(contractsTable.createdAt));
    res.json(contracts.map(mapContract));
  } catch (err) {
    req.log.error({ err }, "Failed to list contracts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/contracts", async (req, res) => {
  try {
    const { contractType, title, counterparty, counterpartyEmail, valueUsd, currency, startDate, endDate, notes } = req.body;
    if (!contractType || !title || !counterparty || !currency) {
      res.status(400).json({ error: "contractType, title, counterparty and currency are required" });
      return;
    }
    const [contract] = await db.insert(contractsTable).values({
      id: randomUUID(),
      artistId: DEMO_ARTIST_ID,
      contractType,
      title,
      counterparty,
      counterpartyEmail: counterpartyEmail ?? null,
      valueUsd: valueUsd !== undefined ? valueUsd.toString() : null,
      currency,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      notes: notes ?? null,
      status: "draft",
    }).returning();
    res.status(201).json(mapContract(contract));
  } catch (err) {
    req.log.error({ err }, "Failed to create contract");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/contracts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, signedDate, notes } = req.body;
    const [contract] = await db.update(contractsTable)
      .set({
        ...(status !== undefined && { status }),
        ...(signedDate !== undefined && { signedDate }),
        ...(notes !== undefined && { notes }),
      })
      .where(eq(contractsTable.id, id))
      .returning();
    if (!contract) {
      res.status(404).json({ error: "Contract not found" });
      return;
    }
    res.json(mapContract(contract));
  } catch (err) {
    req.log.error({ err }, "Failed to update contract");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
