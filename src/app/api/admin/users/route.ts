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

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get users
 *     description: Returns a list of importer and supplier users. Only ADMIN users can access this endpoint.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             example:
 *               - id: "uuid"
 *                 email: "importer@example.com"
 *                 role: "IMPORTER"
 *                 companyName: "Importer Company"
 *                 country: "Serbia"
 *                 address: "Main Street 10"
 *                 createdAt: "2026-03-07T10:00:00Z"
 *               - id: "uuid"
 *                 email: "supplier@example.com"
 *                 role: "SUPPLIER"
 *                 companyName: "Supplier Company"
 *                 country: "Germany"
 *                 address: "Business Street 5"
 *                 createdAt: "2026-03-07T11:00:00Z"
 *       401:
 *         description: Unauthorized (missing or invalid auth token)
 *       403:
 *         description: Forbidden (user is not ADMIN)
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