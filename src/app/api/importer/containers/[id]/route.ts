import { db } from "@/db";
import { containers } from "@/db/schema/containers";
import { containerOffers } from "@/db/schema/containerOffer";
import { productOffers } from "@/db/schema/productOffers";

import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sub: userId, role } = verifyAuthToken(token);

  if (role !== "IMPORTER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // 🔥 OVDE JE PRAVA ISPRAVKA
  const url = new URL(req.url);
  const containerId = url.pathname.split("/").pop();

  if (!containerId) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
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
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const items = await db
    .select({
      id: containerOffers.id,
      quantity: containerOffers.quantity,
      name: productOffers.name,
      price: containerOffers.unitPriceAtTime,
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

  const maxVolume =
    container.maxWidth *
    container.maxHeight *
    container.maxDepth;

  let usedVolume = 0;

  for (const item of items) {
    usedVolume +=
      (item.width / 100) *
      (item.height / 100) *
      (item.depth / 100) *
      item.quantity;
  }

  const percentage =
    maxVolume === 0 ? 0 : (usedVolume / maxVolume) * 100;

  return Response.json({
    container,
    items,
    usedVolume,
    maxVolume,
    percentage,
  });
}