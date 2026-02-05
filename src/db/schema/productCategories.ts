import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const productCategories = pgTable("product_category", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", { length: 120 }).notNull().unique(),
});

