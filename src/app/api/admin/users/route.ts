import { db } from "@/db";
import { users } from "@/db/schema/users";
import { inArray, asc } from "drizzle-orm";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

export interface AdminUserDto {
  id: string;
  email: string;
  role: "ADMIN" | "IMPORTER" | "SUPPLIER";
  companyName: string | null;
  country: string | null;
  address: string | null;
  createdAt: Date;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = verifyAuthToken(token);

  if (role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const data: AdminUserDto[] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      companyName: users.companyName,
      country: users.country,
      address: users.address,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(inArray(users.role, ["IMPORTER", "SUPPLIER"]))
    .orderBy(asc(users.createdAt));

  return Response.json(data);
}