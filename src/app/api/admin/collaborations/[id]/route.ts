import { db } from "@/db";
import { collaborations } from "@/db/schema/collaborations";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

/**
 * @swagger
 * /api/admin/collaborations/{id}:
 *   delete:
 *     summary: Delete collaboration
 *     description: Deletes a collaboration by its ID. Only users with ADMIN role can perform this action.
 *     tags:
 *       - Collaborations
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the collaboration to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collaboration successfully deleted
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *       401:
 *         description: Unauthorized (missing auth token)
 *       403:
 *         description: Forbidden (user is not ADMIN)
 *       404:
 *         description: Collaboration not found
 *       500:
 *         description: Internal server error
 */



export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = verifyAuthToken(token);

  if (role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await db
    .delete(collaborations)
    .where(eq(collaborations.id, id))
    .returning({ id: collaborations.id });

  if (deleted.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}