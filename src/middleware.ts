import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE = "auth";
type Role = "ADMIN" | "IMPORTER" | "SUPPLIER";

async function verifyInMiddleware(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const { payload } = await jwtVerify(token, secret);

  const sub = payload.sub;
  const role = payload.role as Role | undefined;

  if (!sub || !role) throw new Error("Invalid token");
  return { sub, role };
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(AUTH_COOKIE)?.value;

  //  nije ulogovan
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const user = await verifyInMiddleware(token);

    //  ADMIN rute
    if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    //  IMPORTER rute
    if (
      pathname.startsWith("/importer") &&
      !["ADMIN", "IMPORTER"].includes(user.role)
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    //  SUPPLIER rute
    if (
      pathname.startsWith("/supplier") &&
      !["ADMIN", "SUPPLIER"].includes(user.role)
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    //  sve dozvoljeno
    return NextResponse.next();
  } catch {
    //  token ne važi
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/importer/:path*",
    "/supplier/:path*",
  ],
};
