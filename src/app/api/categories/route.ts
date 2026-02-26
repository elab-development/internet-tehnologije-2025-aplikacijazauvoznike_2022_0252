import { db } from "@/db";
import { productCategories } from "@/db/schema/productCategories";
import { asc } from "drizzle-orm";

export type CategoryDto = {
  id: string;
  name: string;
};

export async function GET() {
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

  return Response.json(category);
}
