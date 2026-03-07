import { AUTH_COOKIE } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logs out the authenticated user by clearing the authentication cookie.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *       500:
 *         description: Internal server error
 */

export async function POST() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return res;
}
