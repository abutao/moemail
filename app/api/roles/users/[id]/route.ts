import { auth } from "@/lib/auth"
import { createDb } from "@/lib/db"
import { apiKeys, userRoles, users } from "@/lib/schema"
import { ROLES } from "@/lib/permissions"
import { eq } from "drizzle-orm"

export const runtime = "edge"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!id) {
      return Response.json({ error: "Missing user id" }, { status: 400 })
    }

    if (session?.user?.id === id) {
      return Response.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const db = createDb()
    const targetUserRole = await db.query.userRoles.findFirst({
      where: eq(userRoles.userId, id),
      with: { role: true },
    })

    if (targetUserRole?.role.name === ROLES.EMPEROR) {
      return Response.json({ error: "Cannot delete administrator account" }, { status: 400 })
    }

    await db.delete(apiKeys).where(eq(apiKeys.userId, id))

    const deleted = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id })

    if (!deleted.length) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Failed to delete user:", error)
    return Response.json({ error: "Failed to delete user" }, { status: 500 })
  }
}