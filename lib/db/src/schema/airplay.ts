import { pgTable, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const stationTypeEnum = pgEnum("station_type", ["radio", "tv", "streaming"]);

export const airplayDetectionsTable = pgTable("airplay_detections", {
  id: text("id").primaryKey(),
  songId: text("song_id").notNull(),
  artistId: text("artist_id").notNull(),
  stationName: text("station_name").notNull(),
  stationType: stationTypeEnum("station_type").notNull().default("radio"),
  country: text("country").notNull(),
  detectedAt: timestamp("detected_at", { withTimezone: true }).notNull(),
  durationSeconds: integer("duration_seconds"),
  claimed: boolean("claimed").notNull().default(false),
  cosotaClaimRef: text("cosota_claim_ref"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAirplayDetectionSchema = createInsertSchema(airplayDetectionsTable).omit({ createdAt: true });
export type InsertAirplayDetection = z.infer<typeof insertAirplayDetectionSchema>;
export type AirplayDetection = typeof airplayDetectionsTable.$inferSelect;
