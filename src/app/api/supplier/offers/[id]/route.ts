import { db } from "@/db";
import { productOffers } from "@/db/schema/productOffers";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

type Role = "ADMIN" | "IMPORTER" | "SUPPLIER";

/**
 * @swagger
 * /api/supplier/offers/{id}:
 *   delete:
 *     summary: Delete supplier product offer
 *     description: Deletes a product offer created by the authenticated supplier (for example iPhone 15, Samsung Galaxy S24, MacBook Air M2).
 *     tags:
 *       - Supplier Offers
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product offer ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product offer successfully deleted
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *       401:
 *         description: Unauthorized (missing authentication cookie)
 *       403:
 *         description: Forbidden (only SUPPLIER users can delete their offers)
 *       404:
 *         description: Product offer not found
 *       500:
 *         description: Internal server error
 */

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  const { id: offerId } = await params; 

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sub: userId, role } = verifyAuthToken(token);

  if (role !== "SUPPLIER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await db
    .delete(productOffers)
    .where(and(eq(productOffers.id, offerId), eq(productOffers.supplierId, userId)))
    .returning({ id: productOffers.id });

  if (deleted.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}
