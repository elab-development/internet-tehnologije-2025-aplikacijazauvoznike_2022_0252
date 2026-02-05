import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  numeric,
  real,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { productCategories } from "./productCategories";

export const productOffers = pgTable("product_offer", {
  id: uuid("id").defaultRandom().primaryKey(),

  supplierId: uuid("supplier_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  categoryId: uuid("category_id")
    .notNull()
    .references(() => productCategories.id, { onDelete: "restrict" }),

  code: varchar("code", { length: 64 }).notNull(),

  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  imageUrl: text("image_url").notNull(),

  price: numeric("price", { precision: 12, scale: 2 }).notNull(),

  width: real("width").notNull(),
  height: real("height").notNull(),
  depth: real("depth").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
