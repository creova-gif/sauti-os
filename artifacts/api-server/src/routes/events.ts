import { Router } from "express";
import { db } from "@workspace/db";
import { eventsTable, ticketPurchasesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();
const DEMO_ARTIST_ID = "demo-artist-001";

function mapEvent(e: typeof eventsTable.$inferSelect) {
  return {
    id: e.id,
    name: e.name,
    description: e.description,
    venue: e.venue,
    city: e.city,
    country: e.country,
    eventDate: e.eventDate,
    doorsOpen: e.doorsOpen,
    capacity: e.capacity,
    ticketsSold: e.ticketsSold,
    ticketPriceTzs: e.ticketPriceTzs !== null ? Number(e.ticketPriceTzs) : null,
    ticketPriceUsd: e.ticketPriceUsd !== null ? Number(e.ticketPriceUsd) : null,
    status: e.status,
    totalRevenueTzs: Number(e.totalRevenueTzs),
    platformFeePct: Number(e.platformFeePct),
    createdAt: e.createdAt.toISOString(),
  };
}

router.get("/events", async (req, res) => {
  try {
    const events = await db.select().from(eventsTable)
      .where(eq(eventsTable.artistId, DEMO_ARTIST_ID))
      .orderBy(desc(eventsTable.createdAt));
    res.json(events.map(mapEvent));
  } catch (err) {
    req.log.error({ err }, "Failed to list events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/events", async (req, res) => {
  try {
    const { name, description, venue, city, country, eventDate, doorsOpen, capacity, ticketPriceTzs, ticketPriceUsd } = req.body;
    if (!name || !country || !eventDate || capacity === undefined) {
      res.status(400).json({ error: "name, country, eventDate and capacity are required" });
      return;
    }
    const [event] = await db.insert(eventsTable).values({
      id: randomUUID(),
      artistId: DEMO_ARTIST_ID,
      name,
      description: description ?? null,
      venue: venue ?? null,
      city: city ?? null,
      country,
      eventDate,
      doorsOpen: doorsOpen ?? null,
      capacity,
      ticketPriceTzs: ticketPriceTzs !== undefined ? ticketPriceTzs.toString() : null,
      ticketPriceUsd: ticketPriceUsd !== undefined ? ticketPriceUsd.toString() : null,
      status: "draft",
      ticketsSold: 0,
      totalRevenueTzs: "0",
      platformFeePct: "3.0",
    }).returning();
    res.status(201).json(mapEvent(event));
  } catch (err) {
    req.log.error({ err }, "Failed to create event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description, venue } = req.body;
    const [event] = await db.update(eventsTable)
      .set({
        ...(status !== undefined && { status }),
        ...(description !== undefined && { description }),
        ...(venue !== undefined && { venue }),
      })
      .where(eq(eventsTable.id, id))
      .returning();
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json(mapEvent(event));
  } catch (err) {
    req.log.error({ err }, "Failed to update event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/events/:id/tickets", async (req, res) => {
  try {
    const { id } = req.params;
    const { buyerName, buyerPhone, buyerEmail, quantity, paymentMethod, mpesaRef } = req.body;
    if (!buyerName || !buyerPhone || !quantity || !paymentMethod) {
      res.status(400).json({ error: "buyerName, buyerPhone, quantity and paymentMethod are required" });
      return;
    }
    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    const totalTzs = Number(event.ticketPriceTzs ?? 0) * quantity;
    const ticketCode = `TKT-${Date.now().toString(36).toUpperCase()}`;

    const [ticket] = await db.insert(ticketPurchasesTable).values({
      id: randomUUID(),
      eventId: id,
      buyerName,
      buyerPhone,
      buyerEmail: buyerEmail ?? null,
      quantity,
      totalTzs: totalTzs.toString(),
      paymentMethod,
      mpesaRef: mpesaRef ?? null,
      ticketCode,
      checkedIn: false,
    }).returning();

    // Update event ticket count and revenue
    await db.update(eventsTable).set({
      ticketsSold: event.ticketsSold + quantity,
      totalRevenueTzs: (Number(event.totalRevenueTzs) + totalTzs).toString(),
    }).where(eq(eventsTable.id, id));

    res.status(201).json({
      id: ticket.id,
      eventId: ticket.eventId,
      buyerName: ticket.buyerName,
      buyerPhone: ticket.buyerPhone,
      buyerEmail: ticket.buyerEmail,
      quantity: ticket.quantity,
      totalTzs: Number(ticket.totalTzs),
      paymentMethod: ticket.paymentMethod,
      mpesaRef: ticket.mpesaRef,
      ticketCode: ticket.ticketCode,
      checkedIn: ticket.checkedIn,
      createdAt: ticket.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to sell ticket");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
