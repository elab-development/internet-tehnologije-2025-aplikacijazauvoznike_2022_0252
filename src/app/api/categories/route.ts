import { db } from "@/db";
import { productCategories } from "@/db/schema/productCategories";
import { asc } from "drizzle-orm";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

export type CategoryDto = {
  id: string;
  name: string;
};

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