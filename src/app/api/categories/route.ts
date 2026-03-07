import { db } from "@/db";
import { productCategories } from "@/db/schema/productCategories";
import { asc } from "drizzle-orm";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

export type CategoryDto = {
  id: string;
  name: string;
};

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get product categories
 *     description: Returns a list of available product categories such as Phones, Laptops, Tablets, Accessories, and Televisions. Only users with SUPPLIER role can access this endpoint.
 *     tags:
 *       - Product Categories
 *     responses:
 *       200:
 *         description: List of product categories
 *         content:
 *           application/json:
 *             example:
 *               - id: "uuid"
 *                 name: "Phones"
 *               - id: "uuid"
 *                 name: "Laptops"
 *               - id: "uuid"
 *                 name: "Tablets"
 *               - id: "uuid"
 *                 name: "Accessories"
 *       401:
 *         description: Unauthorized (missing authentication cookie)
 *       403:
 *         description: Forbidden (only SUPPLIER users can access categories)
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create product category
 *     description: Creates a new product category for supplier products (for example Phones, Laptops, Tablets, Accessories, or Televisions).
 *     tags:
 *       - Product Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Televisions"
 *     responses:
 *       201:
 *         description: Product category successfully created
 *         content:
 *           application/json:
 *             example:
 *               id: "uuid"
 *               name: "Televisions"
 *       400:
 *         description: Category name is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (only SUPPLIER users can create categories)
 *       409:
 *         description: Category already exists
 *       500:
 *         description: Internal server error
 */

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = verifyAuthToken(token);

  if (role !== "SUPPLIER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const data: CategoryDto[] = await db
    .select({
      id: productCategories.id,
      name: productCategories.name,
    })
    .from(productCategories)
    .orderBy(asc(productCategories.name));

  return Response.json(data);
}




export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = verifyAuthToken(token);

  if (role !== "SUPPLIER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return Response.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const [category] = await db
      .insert(productCategories)
      .values({
        name: body.name.trim(),
      })
      .returning();

    return Response.json(category, { status: 201 });

  } catch (err: any) {
    const code =
      err?.code ??
      err?.cause?.code ??
      err?.originalError?.code ??
      err?.cause?.originalError?.code;

    if (code === "23505") {
      return Response.json(
        { error: "Category already exists" },
        { status: 409 }
      );
    }

    console.error("Create category error:", err);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}