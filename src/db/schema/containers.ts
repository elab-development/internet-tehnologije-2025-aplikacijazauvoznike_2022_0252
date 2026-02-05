import { pgTable, uuid, varchar, timestamp, real } from "drizzle-orm/pg-core";
import { users } from "./users";

export const containers = pgTable("container", {
  id: uuid("id").defaultRandom().primaryKey(),

  importerId: uuid("importer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  label: varchar("label", { length: 128 }),

  maxWidth: real("max_width").notNull(),
  maxHeight: real("max_height").notNull(),
  maxDepth: real("max_depth").notNull(),

  status: varchar("status", { length: 32 })
  .notNull()
  .default("DRAFT"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  
});
