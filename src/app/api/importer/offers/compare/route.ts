import { db } from "@/db";
import { productOffers } from "@/db/schema/productOffers";
import { productCategories } from "@/db/schema/productCategories";
import { collaborations } from "@/db/schema/collaborations";
import { users } from "@/db/schema/users";

import { desc, eq, and, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sub: userId, role } = verifyAuthToken(token);

    if (role !== "IMPORTER") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return Response.json(
        { error: "No product IDs provided." },
        { status: 400 }
      );
    }

    const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean);

    if (ids.length < 2 || ids.length > 4) {
      return Response.json(
        { error: "You must compare between 2 and 4 products." },
        { status: 400 }
      );
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
      .innerJoin(
        productCategories,
        eq(productOffers.categoryId, productCategories.id)
      )
      .innerJoin(
        supplierUser,
        eq(supplierUser.id, productOffers.supplierId)
      )
      .where(inArray(productOffers.id, ids))
      .orderBy(desc(productOffers.createdAt));

    if (data.length < 1) {
      return Response.json(
        { error: "No matching offers found." },
        { status: 404 }
      );
    }

    return Response.json(data);
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}