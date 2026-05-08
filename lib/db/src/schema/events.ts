import { pgTable, text, numeric, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventStatusEnum = pgEnum("event_status", ["draft", "on_sale", "sold_out", "completed", "cancelled"]);

export const eventsTable = pgTable("events", {
  id: text("id").primaryKey(),
  artistId: text("artist_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  venue: text("venue"),
  city: text("city"),
  country: text("country").notNull().default("TZ"),
  eventDate: text("event_date").notNull(),
  doorsOpen: text("doors_open"),
  capacity: integer("capacity").notNull().default(0),
  ticketsSold: integer("tickets_sold").notNull().default(0),
  ticketPriceTzs: numeric("ticket_price_tzs", { precision: 12, scale: 2 }),
  ticketPriceUsd: numeric("ticket_price_usd", { precision: 10, scale: 2 }),
  status: eventStatusEnum("status").notNull().default("draft"),
  totalRevenueTzs: numeric("total_revenue_tzs", { precision: 16, scale: 2 }).notNull().default("0"),
  platformFeePct: numeric("platform_fee_pct", { precision: 5, scale: 2 }).notNull().default("3.0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const ticketPurchasesTable = pgTable("ticket_purchases", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerPhone: text("buyer_phone").notNull(),
  buyerEmail: text("buyer_email"),
  quantity: integer("quantity").notNull().default(1),
  totalTzs: numeric("total_tzs", { precision: 16, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  mpesaRef: text("mpesa_ref"),
  ticketCode: text("ticket_code").notNull(),
  checkedIn: boolean("checked_in").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ createdAt: true, updatedAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;

export const insertTicketPurchaseSchema = createInsertSchema(ticketPurchasesTable).omit({ createdAt: true });
export type InsertTicketPurchase = z.infer<typeof insertTicketPurchaseSchema>;
export type TicketPurchase = typeof ticketPurchasesTable.$inferSelect;
