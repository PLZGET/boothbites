import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Revision checks atomically protect stock and queue capacity.
export const booths = sqliteTable("booths", {
  id: text("id").primaryKey(),
  accessHash: text("access_hash").notNull(),
  state: text("state").notNull(),
  revision: integer("revision").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

// Shared daily budget for public AI menu scanning.
export const aiUsage = sqliteTable("ai_usage", {
  id: text("id").primaryKey(),
  requests: integer("requests").notNull().default(0),
});
