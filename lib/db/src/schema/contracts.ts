import { pgTable, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contractTypeEnum = pgEnum("contract_type", ["performance", "brand_deal", "sync_license", "management", "distribution"]);
export const contractStatusEnum = pgEnum("contract_status", ["draft", "pending_signature", "active", "completed", "cancelled", "disputed"]);

export const contractsTable = pgTable("contracts", {
  id: text("id").primaryKey(),
  artistId: text("artist_id").notNull(),
  contractType: contractTypeEnum("contract_type").notNull(),
  title: text("title").notNull(),
  counterparty: text("counterparty").notNull(),
  counterpartyEmail: text("counterparty_email"),
  valueUsd: numeric("value_usd", { precision: 12, scale: 2 }),
  valueTzs: numeric("value_tzs", { precision: 16, scale: 2 }),
  currency: text("currency").notNull().default("USD"),
  status: contractStatusEnum("status").notNull().default("draft"),
  signedDate: text("signed_date"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  termsText: text("terms_text"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertContractSchema = createInsertSchema(contractsTable).omit({ createdAt: true, updatedAt: true });
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contractsTable.$inferSelect;
