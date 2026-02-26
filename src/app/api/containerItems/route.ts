import { db } from "@/db";
import { containers } from "@/db/schema/containers";
import { containerOffers } from "@/db/schema/containerOffer";
import { productOffers } from "@/db/schema/productOffers";

import { eq, and } from "drizzle-orm";

import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

export async function POST(req: Request) {

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sub: userId, role } = verifyAuthToken(token);

  if (role !== "IMPORTER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { containerId, offerId, quantity } = body;

  const qty = Number(quantity);

  if (!containerId || !offerId || !qty || qty <= 0) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }


  const [container] = await db
    .select()
    .from(containers)
    .where(
      and(
        eq(containers.id, containerId),
        eq(containers.importerId, userId)
      )
    );

  if (!container) {
    return Response.json({ error: "Container not found" }, { status: 404 });
  }

  if (container.status !== "DRAFT") {
    return Response.json(
      { error: "Container is finalized" },
      { status: 400 }
    );
  }

  const maxVolume =
    container.maxWidth *
    container.maxHeight *
    container.maxDepth;


  const existingItems = await db
    .select({
      quantity: containerOffers.quantity,
      width: productOffers.width,
      height: productOffers.height,
      depth: productOffers.depth,
    })
    .from(containerOffers)
    .innerJoin(
      productOffers,
      eq(productOffers.id, containerOffers.offerId)
    )
    .where(eq(containerOffers.containerId, containerId));

  let currentVolume = 0;

  for (const item of existingItems) {
    const itemVolume =
      (item.width / 100) *
      (item.height / 100) *
      (item.depth / 100) *
      item.quantity;

    currentVolume += itemVolume;
  }


  const [offer] = await db
    .select()
    .from(productOffers)
    .where(eq(productOffers.id, offerId));

  if (!offer) {
    return Response.json({ error: "Offer not found" }, { status: 404 });
  }

  const newVolume =
    (offer.width / 100) *
    (offer.height / 100) *
    (offer.depth / 100) *
    qty;

  if (currentVolume + newVolume > maxVolume) {
    return Response.json(
      { error: "Not enough space in container" },
      { status: 400 }
    );
  }


  const [existing] = await db
    .select()
    .from(containerOffers)
    .where(
      and(
        eq(containerOffers.containerId, containerId),
        eq(containerOffers.offerId, offerId)
      )
    );

  if (existing) {
    await db
      .update(containerOffers)
      .set({
        quantity: existing.quantity + qty,
      })
      .where(eq(containerOffers.id, existing.id));
  } else {
    await db.insert(containerOffers).values({
      containerId,
      offerId,
      quantity: qty,
      unitPriceAtTime: offer.price,
    });
  }

  return Response.json({ success: true });
}