import { db } from "@/db";
import { containers } from "@/db/schema/containers";

import { desc, eq, and } from "drizzle-orm";

import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

/**
 * @swagger
 * /api/importer/containers:
 *   get:
 *     summary: Get importer containers
 *     description: Returns a list of containers created by the authenticated importer. Containers can be filtered by status (DRAFT or FINALIZED).
 *     tags:
 *       - Containers
 *     parameters:
 *       - name: status
 *         in: query
 *         required: false
 *         description: Optional container status filter (DRAFT or FINALIZED)
 *         schema:
 *           type: string
 *           example: DRAFT
 *     responses:
 *       200:
 *         description: List of containers
 *         content:
 *           application/json:
 *             example:
 *               - id: "uuid"
 *                 label: "Electronics shipment"
 *                 maxWidth: 2.5
 *                 maxHeight: 2.4
 *                 maxDepth: 12
 *                 status: "DRAFT"
 *                 createdAt: "2026-03-07T10:00:00Z"
 *               - id: "uuid"
 *                 label: "TV shipment"
 *                 maxWidth: 2.3
 *                 maxHeight: 2.5
 *                 maxDepth: 10
 *                 status: "FINALIZED"
 *                 createdAt: "2026-03-06T14:00:00Z"
 *       401:
 *         description: Unauthorized (missing authentication cookie)
 *       403:
 *         description: Forbidden (only IMPORTER users can access containers)
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create container
 *     description: Creates a new container for an importer. Containers are used to store selected product offers (for example iPhone 15, MacBook Air, Samsung Galaxy S24) before finalizing shipment.
 *     tags:
 *       - Containers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             label: "Electronics shipment"
 *             maxWidth: 2.5
 *             maxHeight: 2.4
 *             maxDepth: 12
 *     responses:
 *       200:
 *         description: Container successfully created
 *         content:
 *           application/json:
 *             example:
 *               id: "uuid"
 *               importerId: "uuid"
 *               label: "Electronics shipment"
 *               maxWidth: 2.5
 *               maxHeight: 2.4
 *               maxDepth: 12
 *               status: "DRAFT"
 *       400:
 *         description: Invalid container dimensions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (only IMPORTER users can create containers)
 *       500:
 *         description: Internal server error
 */

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