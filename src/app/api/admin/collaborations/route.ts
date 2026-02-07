import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { inArray, eq, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/db";
import { users } from "@/db/schema/users";
import { collaborations } from "@/db/schema/collaborations";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

type Claims = {
  sub: string;
  email: string;
  role: "ADMIN" | "IMPORTER" | "SUPPLIER";
};

type Body = {
  importerId: string;
  supplierId: string;
};

async function requireAdmin(): Promise<Claims | NextResponse> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const claims = verifyAuthToken(token);
    if (claims.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return claims;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

function getPgCode(e: any): string | undefined {
  return (
    e?.code ??
    e?.cause?.code ??
    e?.originalError?.code ??
    e?.cause?.originalError?.code
  );
}

function isDuplicateCollabError(e: any): boolean {
  const code = getPgCode(e);
  if (code === "23505") return true;

  const msg = String(
    e?.message ?? e?.cause?.message ?? e?.detail ?? e?.cause?.detail ?? ""
  ).toLowerCase();

  return msg.includes("duplicate key") || msg.includes("unique constraint");
}


export async function GET() {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;


  const importer = alias(users, "importer");
  const supplier = alias(users, "supplier");

  const data = await db
    .select({
      id: collaborations.id,
      importerId: collaborations.importerId,
      supplierId: collaborations.supplierId,
      createdAt: collaborations.createdAt,

      importerEmail: importer.email,
      importerCompanyName: importer.companyName,

      supplierEmail: supplier.email,
      supplierCompanyName: supplier.companyName,
    })
    .from(collaborations)
    .innerJoin(importer, eq(importer.id, collaborations.importerId))
    .innerJoin(supplier, eq(supplier.id, collaborations.supplierId))
    .orderBy(desc(collaborations.createdAt));

  return NextResponse.json(data);
}


export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const body = (await req.json().catch(() => null)) as Body | null;
  const importerId = body?.importerId?.trim();
  const supplierId = body?.supplierId?.trim();

  if (!importerId || !supplierId) {
    return NextResponse.json(
      { error: "Importer i supplier su obavezni." },
      { status: 400 }
    );
  }

  if (importerId === supplierId) {
    return NextResponse.json(
      { error: "Importer i supplier ne mogu biti isti user." },
      { status: 400 }
    );
  }


  const pair = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(inArray(users.id, [importerId, supplierId]));

  const importer = pair.find((u) => u.id === importerId);
  const supplier = pair.find((u) => u.id === supplierId);

  if (!importer) {
    return NextResponse.json({ error: "Importer ne postoji." }, { status: 400 });
  }
  if (!supplier) {
    return NextResponse.json({ error: "Supplier ne postoji." }, { status: 400 });
  }

  if (importer.role !== "IMPORTER") {
    return NextResponse.json(
      { error: "Izabrani korisnik nije importer." },
      { status: 400 }
    );
  }

  if (supplier.role !== "SUPPLIER") {
    return NextResponse.json(
      { error: "Izabrani korisnik nije supplier." },
      { status: 400 }
    );
  }

  try {
    await db.insert(collaborations).values({ importerId, supplierId });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    if (isDuplicateCollabError(e)) {
      return NextResponse.json(
        { error: "Već postoji saradnja između izabranog importera i supplier-a." },
        { status: 409 }
      );
    }

    console.error("DB ERROR:", e);
    console.error("PG CODE:", getPgCode(e));

    return NextResponse.json(
      { error: "Došlo je do greške na serveru." },
      { status: 500 }
    );
  }
}

