import {
  pgTable,
  uuid,
  timestamp,
  integer,
  numeric,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { containers } from "./containers";
import { productOffers } from "./productOffers";

export const containerOffers = pgTable(
  "container_offer",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    containerId: uuid("container_id")
      .notNull()
      .references(() => containers.id, { onDelete: "cascade" }),

    offerId: uuid("offer_id")
      .notNull()
      .references(() => productOffers.id, { onDelete: "restrict" }),

    quantity: integer("quantity").notNull(),

    unitPriceAtTime: numeric("unit_price_at_time", {
      precision: 12,
      scale: 2,
    }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqContainerOffer: uniqueIndex("uq_container_offer").on(
      t.containerId,
      t.offerId
    ),
  })
);
