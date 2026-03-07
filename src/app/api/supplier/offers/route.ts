import { db } from "@/db";
import { productOffers } from "@/db/schema/productOffers";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth"; 
import { productCategories } from "@/db/schema/productCategories";

/**
 * @swagger
 * /api/supplier/offers:
 *   get:
 *     summary: Get supplier product offers
 *     description: Returns all product offers created by the authenticated supplier (for example iPhone 15, MacBook Air M2, Samsung Galaxy S24, LG OLED TV).
 *     tags:
 *       - Supplier Offers
 *     responses:
 *       200:
 *         description: List of supplier product offers
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
 *                 createdAt: "2026-03-07T10:00:00Z"
 *       401:
 *         description: Unauthorized (missing authentication cookie)
 *       403:
 *         description: Forbidden (only SUPPLIER users can access their offers)
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create product offer
 *     description: Creates a new product offer for a supplier. Products can include items such as iPhone 15, MacBook Air M2, Samsung Galaxy S24, LG OLED TV, tablets, or accessories.
 *     tags:
 *       - Supplier Offers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             categoryId: "uuid"
 *             code: "IP15-128"
 *             name: "iPhone 15"
 *             description: "Apple iPhone 15, 128GB"
 *             imageUrl: "https://example.com/iphone15.jpg"
 *             price: "800.00"
 *             width: 7.1
 *             height: 14.7
 *             depth: 0.8
 *     responses:
 *       201:
 *         description: Product offer successfully created
 *         content:
 *           application/json:
 *             example:
 *               id: "uuid"
 *               message: "Offer created"
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (only SUPPLIER users can create offers)
 *       500:
 *         description: Internal server error
 */

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { sub: userId, role } = verifyAuthToken(token);
  if (role !== "SUPPLIER") return Response.json({ error: "Forbidden" }, { status: 403 });

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
    })
    .from(productOffers)
    .innerJoin(productCategories, eq(productOffers.categoryId, productCategories.id))
    .where(eq(productOffers.supplierId, userId))
    .orderBy(desc(productOffers.createdAt));

  return Response.json(data);
}



type Role = "ADMIN" | "IMPORTER" | "SUPPLIER";

export async function POST(req: Request) {
  try {
    
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sub: userId, role } = verifyAuthToken(token);

    if (role !== "SUPPLIER") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

  
    const body = await req.json();

    const {
      categoryId,
      code,
      name,
      description,
      imageUrl,
      price,
      width,
      height,
      depth,
    } = body ?? {};

    
    if (
      !categoryId ||
      !code ||
      !name ||
      !imageUrl ||
      price === undefined ||
      width === undefined ||
      height === undefined ||
      depth === undefined
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    
    const inserted = await db
      .insert(productOffers)
      .values({
        supplierId: userId,          
        categoryId,
        code,
        name,
        description: description ?? null,
        imageUrl,
        price,                        
        width,
        height,
        depth,
      })
      .returning({
        id: productOffers.id,
      });

    return Response.json(
      {
        id: inserted[0].id,
        message: "Offer created",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/supplier/offers error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
