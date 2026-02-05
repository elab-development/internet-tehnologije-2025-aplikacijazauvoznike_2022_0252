import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { AUTH_COOKIE, cookieOpts, signAuthToken } from "@/lib/auth";

type Body = {
  email: string;
  password: string;
  role: "IMPORTER" | "SUPPLIER";

  companyName: string;
  country: string;
  address: string;
};

export async function POST(req: Request) {
  const { email, password, role, companyName, country, address } =
    (await req.json()) as Body;

  if (!email || !password || !role || !companyName || !country || !address) {
    return NextResponse.json({ error: "Nedostaju podaci" }, { status: 400 });
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));

  if (existing.length) {
    return NextResponse.json({ error: "Email već postoji" }, { status: 400 });
  }

  const passHash = await bcrypt.hash(password, 10);

  const [u] = await db
    .insert(users)
    .values({
      email,
      passHash,
      role, 
      companyName,
      country,
      address,
    })
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
      companyName: users.companyName,
      country: users.country,
      address: users.address,
    });

  const token = signAuthToken({
    sub: u.id,
    email: u.email,
    role: u.role,
  });

  const res = NextResponse.json(u);
  res.cookies.set(AUTH_COOKIE, token, cookieOpts());
  return res;
}
