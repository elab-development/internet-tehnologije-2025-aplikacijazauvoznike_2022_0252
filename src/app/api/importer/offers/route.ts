import { db } from "@/db";
import { productOffers } from "@/db/schema/productOffers";
import { productCategories } from "@/db/schema/productCategories";
import { collaborations } from "@/db/schema/collaborations";
import { users } from "@/db/schema/users";

import { desc, eq, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

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
