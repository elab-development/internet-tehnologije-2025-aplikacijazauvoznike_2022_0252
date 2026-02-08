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
