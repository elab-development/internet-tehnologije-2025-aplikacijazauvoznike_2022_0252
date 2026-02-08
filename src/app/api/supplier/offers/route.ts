import { db } from "@/db";
import { productOffers } from "@/db/schema/productOffers";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth"; 
import { productCategories } from "@/db/schema/productCategories";


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
