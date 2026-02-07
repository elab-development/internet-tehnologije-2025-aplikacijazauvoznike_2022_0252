import { db } from "@/db";
import { users } from "@/db/schema/users";
import { and, eq, inArray } from "drizzle-orm";

type UpdateUserBody = {
  email?: string;
  companyName?: string | null;
  country?: string | null;
  address?: string | null;

  
  role?: unknown;
  passHash?: unknown;
  id?: unknown;
};

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  
  if (!id || !isUuid(id)) {
    return Response.json({ error: "Neispravan id" }, { status: 400 });
  }

  let body: UpdateUserBody;
  try {
    body = (await req.json()) as UpdateUserBody;
  } catch {
    return Response.json({ error: "Neispravan JSON" }, { status: 400 });
  }

  
  const updateData: Partial<{
    email: string;
    companyName: string | null;
    country: string | null;
    address: string | null;
  }> = {};

  if (typeof body.email === "string") {
    const email = body.email.trim();
    if (!email) {
      return Response.json({ error: "Email je obavezan" }, { status: 400 });
    }
    updateData.email = email;
  }

  if (body.companyName === null || typeof body.companyName === "string") {
    const v = body.companyName;
    updateData.companyName = v === null ? null : v.trim() || null;
  }

  if (body.country === null || typeof body.country === "string") {
    const v = body.country;
    updateData.country = v === null ? null : v.trim() || null;
  }

  if (body.address === null || typeof body.address === "string") {
    const v = body.address;
    updateData.address = v === null ? null : v.trim() || null;
  }

  if (Object.keys(updateData).length === 0) {
    return Response.json(
      { error: "Nema validnih polja za update" },
      { status: 400 }
    );
  }

  try {
    const updated = await db
      .update(users)
      .set(updateData)
      .where(
        and(
          eq(users.id, id),
          inArray(users.role, ["IMPORTER", "SUPPLIER"])
        )
      )
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        companyName: users.companyName,
        country: users.country,
        address: users.address,
        createdAt: users.createdAt,
      });

    if (updated.length === 0) {
      return Response.json(
        { error: "Korisnik nije pronadjen (ili nije importer/supplier)" },
        { status: 404 }
      );
    }

    return Response.json(updated[0]);
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "Greska";

    if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
      return Response.json({ error: "Email je vec zauzet" }, { status: 409 });
    }

    return Response.json({ error: "Neuspesan update" }, { status: 500 });
  }
}
