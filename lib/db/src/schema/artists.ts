import { pgTable, text, numeric, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const artistTierEnum = pgEnum("artist_tier", ["free", "pro", "label"]);

export const artistsTable = pgTable("artists", {
  id: text("id").primaryKey(),
  stageName: text("stage_name").notNull(),
  legalName: text("legal_name"),
  email: text("email").notNull(),
  phone: text("phone"),
  genre: text("genre"),
  bio: text("bio"),
  locationCountry: text("location_country").notNull().default("TZ"),
  locationCity: text("location_city"),
  tier: artistTierEnum("tier").notNull().default("free"),
  cosotaMemberId: text("cosota_member_id"),
  nidaNumber: text("nida_number"),
  walletBalanceUsd: numeric("wallet_balance_usd", { precision: 12, scale: 2 }).notNull().default("0"),
  walletBalanceTzs: numeric("wallet_balance_tzs", { precision: 16, scale: 2 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertArtistSchema = createInsertSchema(artistsTable).omit({ createdAt: true, updatedAt: true });
export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Artist = typeof artistsTable.$inferSelect;
