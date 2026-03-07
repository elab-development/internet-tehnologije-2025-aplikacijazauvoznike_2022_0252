import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { AUTH_COOKIE, cookieOpts, signAuthToken } from "@/lib/auth";

type Body = {
  email: string;
  password: string;
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user with email and password and returns user information. A JWT authentication cookie is set if login is successful.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "user@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               id: "uuid"
 *               email: "user@example.com"
 *               role: "IMPORTER"
 *               companyName: "Example Company"
 *               country: "Serbia"
 *               address: "Main Street 10"
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as Body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const [u] = await db
    .select({
      id: users.id,
      email: users.email,
      passHash: users.passHash,
      role: users.role,
      companyName: users.companyName,
      country: users.country,
      address: users.address,
    })
    .from(users)
    .where(eq(users.email, email));

  if (!u) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const ok = await bcrypt.compare(password, u.passHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = signAuthToken({
    sub: u.id,
    email: u.email,
    role: u.role,
  });

  const res = NextResponse.json({
    id: u.id,
    email: u.email,
    role: u.role,
    companyName: u.companyName,
    country: u.country,
    address: u.address,
  });

  res.cookies.set(AUTH_COOKIE, token, cookieOpts());
  return res;
}