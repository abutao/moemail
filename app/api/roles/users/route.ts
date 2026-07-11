import { createDb } from "@/lib/db"
import { emails, roles, userRoles, users } from "@/lib/schema"
import { eq, like, or, sql } from "drizzle-orm"

export const runtime = "edge"


export async function GET(request: Request) {
  try {
    const db = createDb()
    const url = new URL(request.url)
    const searchText = url.searchParams.get("q")?.trim()
    const limitParam = Number(url.searchParams.get("limit") || "100")
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 100

    const searchPattern = searchText ? `%${searchText}%` : undefined
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        image: users.image,
        role: roles.name,
        emailCount: sql<number>`count(distinct ${emails.id})`,
      })
      .from(users)
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(roles.id, userRoles.roleId))
      .leftJoin(emails, eq(emails.userId, users.id))
      .where(searchPattern ? or(
        like(users.email, searchPattern),
        like(users.username, searchPattern),
        like(users.name, searchPattern),
      ) : undefined)
      .groupBy(users.id, users.name, users.username, users.email, users.image, roles.name)
      .limit(limit)

    return Response.json({ users: rows })
  } catch (error) {
    console.error("Failed to list users:", error)
    return Response.json(
      { error: "Failed to list users" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { searchText } = json as { searchText: string }

    if (!searchText) {
      return Response.json({ error: "请提供用户名或邮箱地址" }, { status: 400 })
    }

    const db = createDb()

    const user = await db.query.users.findFirst({
      where: searchText.includes('@') ? eq(users.email, searchText) : eq(users.username, searchText),
      with: {
        userRoles: {
          with: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return Response.json({ error: "未找到用户" }, { status: 404 })
    }

    return Response.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.userRoles[0]?.role.name
      }
    })
  } catch (error) {
    console.error("Failed to find user:", error)
    return Response.json(
      { error: "查询用户失败" },
      { status: 500 }
    )
  }
} 