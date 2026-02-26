import { db } from "@/db";
import { containers } from "@/db/schema/containers";

import { desc, eq, and } from "drizzle-orm";

import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";


export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sub: userId, role } = verifyAuthToken(token);

  if (role !== "IMPORTER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status");

  const whereCondition =
    statusFilter && (statusFilter === "DRAFT" || statusFilter === "FINALIZED")
      ? and(
          eq(containers.importerId, userId),
          eq(containers.status, statusFilter)
        )
      : eq(containers.importerId, userId);

  const data = await db
    .select({
      id: containers.id,
      label: containers.label,
      maxWidth: containers.maxWidth,
      maxHeight: containers.maxHeight,
      maxDepth: containers.maxDepth,
      status: containers.status,
      createdAt: containers.createdAt,
    })
    .from(containers)
    .where(whereCondition)
    .orderBy(desc(containers.createdAt));

  return Response.json(data);
}



export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sub: userId, role } = verifyAuthToken(token);

  if (role !== "IMPORTER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const width = Number(body.maxWidth);
  const height = Number(body.maxHeight);
  const depth = Number(body.maxDepth);

  if (!width || !height || !depth) {
    return Response.json(
      { error: "Invalid dimensions" },
      { status: 400 }
    );
  }

  if (width < 2 || width > 3) {
    return Response.json(
      { error: "Width must be between 2.00 and 3.00 meters." },
      { status: 400 }
    );
  }

  if (height < 2 || height > 3) {
    return Response.json(
      { error: "Height must be between 2.00 and 3.00 meters." },
      { status: 400 }
    );
  }

  if (depth < 5 || depth > 13) {
    return Response.json(
      { error: "Depth must be between 5.00 and 13.00 meters." },
      { status: 400 }
    );
  }

  const [container] = await db
    .insert(containers)
    .values({
      importerId: userId,
      label: body.label || null,
      maxWidth: width,
      maxHeight: height,
      maxDepth: depth,
      status: "DRAFT",
    })
    .returning();

  return Response.json(container);
}