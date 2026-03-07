import { db } from "@/db";
import { containers } from "@/db/schema/containers";
import { containerOffers } from "@/db/schema/containerOffer";

import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

/**
 * @swagger
 * /api/importer/containers/{id}/items/{itemId}:
 *   delete:
 *     summary: Remove item from container
 *     description: Removes a product offer (for example iPhone 15, MacBook Air, Samsung Galaxy S24) from an importer container. Only users with IMPORTER role can perform this action. Items can only be removed while the container status is DRAFT.
 *     tags:
 *       - Containers
 *     parameters:
 *       - name: containerId
 *         in: path
 *         required: true
 *         description: Container ID
 *         schema:
 *           type: string
 *       - name: itemId
 *         in: path
 *         required: true
 *         description: Container item ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item successfully removed from container
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *       400:
 *         description: Invalid request or container already finalized
 *       401:
 *         description: Unauthorized (missing authentication cookie)
 *       403:
 *         description: Forbidden (only IMPORTER users can modify containers)
 *       404:
 *         description: Container or item not found
 *       500:
 *         description: Internal server error
 */

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