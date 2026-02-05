import {
  pgTable,
  uuid,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const collaborations = pgTable(
  "collaborations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    importerId: uuid("importer_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    importerSupplierUnique: unique(
      "collaborations_importer_supplier_unique"
    ).on(t.importerId, t.supplierId),
  })
);

