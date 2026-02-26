import { db } from "@/db";
import { productCategories } from "@/db/schema/productCategories";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

type Role = "ADMIN" | "IMPORTER" | "SUPPLIER";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = verifyAuthToken(token);

  if (role !== "SUPPLIER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await db
    .delete(productCategories)
    .where(eq(productCategories.id, id))
    .returning({ id: productCategories.id });

  if (deleted.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}