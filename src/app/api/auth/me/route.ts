import { db } from "@/db";
import { users } from "@/db/schema/users";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Returns information about the currently authenticated user based on the authentication cookie.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             example:
 *               user:
 *                 id: "uuid"
 *                 email: "user@example.com"
 *                 role: "IMPORTER"
 *                 companyName: "Example Company"
 *                 country: "Serbia"
 *                 address: "Main Street 10"
 *                 createdAt: "2026-03-07T10:00:00Z"
 *       401:
 *         description: Invalid or expired authentication token
 *       500:
 *         description: Internal server error
 */

export async function GET() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const claims = verifyAuthToken(token);

    const [u] = await db
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
      .where(eq(users.id, claims.sub));

    return NextResponse.json({ user: u ?? null });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
