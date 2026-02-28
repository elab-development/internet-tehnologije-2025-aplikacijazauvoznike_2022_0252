import { db } from "@/db";
import { containers } from "@/db/schema/containers";
import { containerOffers } from "@/db/schema/containerOffer";

import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

export async function DELETE(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sub: userId, role } = verifyAuthToken(token);

  if (role !== "IMPORTER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const parts = url.pathname.split("/");

  const containerId = parts[parts.length - 3];
  const itemId = parts[parts.length - 1];

  if (!containerId || !itemId) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
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
      { error: "Cannot modify finalized container" },
      { status: 400 }
    );
  }

  const result = await db
    .delete(containerOffers)
    .where(
      and(
        eq(containerOffers.id, itemId),
        eq(containerOffers.containerId, containerId)
      )
    );

  if (result.rowCount === 0) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}