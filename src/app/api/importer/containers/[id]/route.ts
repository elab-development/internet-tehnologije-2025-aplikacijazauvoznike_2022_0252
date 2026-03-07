import { db } from "@/db";
import { containers } from "@/db/schema/containers";
import { containerOffers } from "@/db/schema/containerOffer";
import { productOffers } from "@/db/schema/productOffers";

import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

/**
 * @swagger
 * /api/importer/containers/{id}:
 *   get:
 *     summary: Get container details
 *     description: Returns container information and all product offers inside the container (for example iPhone 15, MacBook Air M2, Samsung Galaxy S24). Only users with IMPORTER role can access this endpoint.
 *     tags:
 *       - Containers
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Container ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Container details and items
 *         content:
 *           application/json:
 *             example:
 *               container:
 *                 id: "uuid"
 *                 importerId: "uuid"
 *                 status: "DRAFT"
 *                 maxWidth: 200
 *                 maxHeight: 200
 *                 maxDepth: 200
 *               items:
 *                 - id: "uuid"
 *                   name: "iPhone 15"
 *                   quantity: 10
 *                   price: "800.00"
 *                   width: 7.1
 *                   height: 14.7
 *                   depth: 0.8
 *                 - id: "uuid"
 *                   name: "MacBook Air M2"
 *                   quantity: 5
 *                   price: "1200.00"
 *                   width: 30.4
 *                   height: 21.5
 *                   depth: 1.1
 *               usedVolume: 3.2
 *               maxVolume: 8
 *               percentage: 40
 *       400:
 *         description: Invalid container ID
 *       401:
 *         description: Unauthorized (missing authentication cookie)
 *       403:
 *         description: Forbidden (only IMPORTER users can access containers)
 *       404:
 *         description: Container not found
 *       500:
 *         description: Internal server error
 */

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