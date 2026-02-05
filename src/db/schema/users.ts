import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "IMPORTER",
  "SUPPLIER",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: varchar("email", { length: 255 }).notNull().unique(),
  passHash: text("pass_hash").notNull(),

  companyName: varchar("company_name", { length: 255 }),
  country: varchar("country", { length: 100 }),
  address: text("address"),

  role: userRoleEnum("role").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

