import * as jwt from "jsonwebtoken";

export const AUTH_COOKIE = "auth";
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in env file");
}


export type JwtUserClaims = {
  sub: string; 
  email: string;
  role: "ADMIN" | "IMPORTER" | "SUPPLIER";
};

export function signAuthToken(claims: JwtUserClaims) {
  return jwt.sign(claims, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

export function verifyAuthToken(token: string) {
  const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & JwtUserClaims;

  if (!payload?.sub || !payload.email || !payload.role) {
    throw new Error("Invalid token");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}

export function cookieOpts() {
  return {
    httpOnly: true,            
    sameSite: "lax" as const, 
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, 
  };
}
