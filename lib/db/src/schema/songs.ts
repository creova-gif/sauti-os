import { pgTable, text, numeric, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const songStatusEnum = pgEnum("song_status", ["unregistered", "pending_cosota", "active", "suspended"]);

export const songsTable = pgTable("songs", {
  id: text("id").primaryKey(),
  artistId: text("artist_id").notNull(),
  title: text("title").notNull(),
  isrc: text("isrc"),
  genre: text("genre"),
  releaseDate: text("release_date"),
  durationSeconds: integer("duration_seconds"),
  status: songStatusEnum("status").notNull().default("unregistered"),
  cosotaRef: text("cosota_ref"),
  totalStreams: integer("total_streams").notNull().default(0),
  totalRoyaltiesUsd: numeric("total_royalties_usd", { precision: 12, scale: 2 }).notNull().default("0"),
  platforms: text("platforms").array().notNull().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSongSchema = createInsertSchema(songsTable).omit({ createdAt: true, updatedAt: true });
export type InsertSong = z.infer<typeof insertSongSchema>;
export type Song = typeof songsTable.$inferSelect;
