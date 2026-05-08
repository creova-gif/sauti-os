import { pgTable, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const payoutStatusEnum = pgEnum("payout_status", ["pending", "processing", "completed", "failed"]);

export const royaltyTransactionsTable = pgTable("royalty_transactions", {
  id: text("id").primaryKey(),
  artistId: text("artist_id").notNull(),
  songId: text("song_id"),
  transactionType: text("transaction_type").notNull(),
  platform: text("platform"),
  amountUsd: numeric("amount_usd", { precision: 12, scale: 2 }).notNull(),
  amountTzs: numeric("amount_tzs", { precision: 16, scale: 2 }),
  feeUsd: numeric("fee_usd", { precision: 12, scale: 2 }).notNull().default("0"),
  netUsd: numeric("net_usd", { precision: 12, scale: 2 }).notNull(),
  status: payoutStatusEnum("status").notNull().default("pending"),
  reference: text("reference"),
  description: text("description"),
  periodStart: text("period_start"),
  periodEnd: text("period_end"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRoyaltyTransactionSchema = createInsertSchema(royaltyTransactionsTable).omit({ createdAt: true });
export type InsertRoyaltyTransaction = z.infer<typeof insertRoyaltyTransactionSchema>;
export type RoyaltyTransaction = typeof royaltyTransactionsTable.$inferSelect;
