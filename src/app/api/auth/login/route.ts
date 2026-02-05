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

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as Body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Pogresan email ili lozinka" },
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
      { error: "Pogresan email ili lozinka" },
      { status: 401 }
    );
  }

  const ok = await bcrypt.compare(password, u.passHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Pogresan email ili lozinka" },
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
