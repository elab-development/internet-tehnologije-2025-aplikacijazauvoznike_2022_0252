import { db } from "@/db";
import { productOffers } from "@/db/schema/productOffers";
import { productCategories } from "@/db/schema/productCategories";
import { collaborations } from "@/db/schema/collaborations";
import { users } from "@/db/schema/users";

import { desc, eq, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

/**
 * @swagger
 * /api/importer/offers:
 *   get:
 *     summary: Get available product offers
 *     description: Returns all product offers available to the authenticated importer from suppliers with whom the importer has an active collaboration. Products may include items such as iPhone 15, Samsung Galaxy S24, MacBook Air M2, LG OLED TV, and similar electronics.
 *     tags:
 *       - Importer Offers
 *     responses:
 *       200:
 *         description: List of available product offers
 *         content:
 *           application/json:
 *             example:
 *               - id: "uuid"
 *                 categoryId: "uuid"
 *                 categoryName: "Phones"
 *                 code: "IP15-128"
 *                 name: "iPhone 15"
 *                 description: "Apple iPhone 15, 128GB"
 *                 imageUrl: "https://example.com/iphone15.jpg"
 *                 price: "800.00"
 *                 width: 7.1
 *                 height: 14.7
 *                 depth: 0.8
 *                 supplierId: "uuid"
 *                 supplierEmail: "supplier@example.com"
 *                 supplierCompanyName: "Adriatic Tech DOO"
 *       401:
 *         description: Unauthorized (missing authentication cookie)
 *       403:
 *         description: Forbidden (only IMPORTER users can access supplier offers)
 *       500:
 *         description: Internal server error
 */

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { sub: userId, role } = verifyAuthToken(token);
  if (role !== "IMPORTER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const supplierUser = alias(users, "supplier_user");

  
  const data = await db
    .select({
      id: productOffers.id,

      categoryId: productOffers.categoryId,
      categoryName: productCategories.name,

      code: productOffers.code,
      name: productOffers.name,
      description: productOffers.description,
      imageUrl: productOffers.imageUrl,
      price: productOffers.price,
      width: productOffers.width,
      height: productOffers.height,
      depth: productOffers.depth,
      createdAt: productOffers.createdAt,

      supplierId: productOffers.supplierId,
      supplierEmail: supplierUser.email,
      supplierCompanyName: supplierUser.companyName,
    })
    .from(productOffers)
    .innerJoin(
      collaborations,
      and(
        eq(collaborations.importerId, userId),
        eq(collaborations.supplierId, productOffers.supplierId)
      )
    )
    .innerJoin(productCategories, eq(productOffers.categoryId, productCategories.id))
    .innerJoin(supplierUser, eq(supplierUser.id, productOffers.supplierId))
    .orderBy(desc(productOffers.createdAt));

  return Response.json(data);
}
