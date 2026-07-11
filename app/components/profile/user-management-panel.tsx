"use client"

import { useCallback, useEffect, useState } from "react"
import { Gem, Loader2, RefreshCw, Search, Shield, Sword, User2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ROLES, Role } from "@/lib/permissions"

type ManageableRole = Exclude<Role, typeof ROLES.EMPEROR>

type ManagedUser = {
  id: string
  name?: string | null
  username?: string | null
  email?: string | null
  image?: string | null
  role?: Role | null
  emailCount?: number
}

const roleLabels: Record<Role, string> = {
  [ROLES.EMPEROR]: "管理员",
  [ROLES.DUKE]: "超级用户",
  [ROLES.KNIGHT]: "高级用户",
  [ROLES.CIVILIAN]: "普通用户",
}

const roleIcons = {
  [ROLES.DUKE]: Gem,
  [ROLES.KNIGHT]: Sword,
  [ROLES.CIVILIAN]: User2,
} as const

const manageableRoles: ManageableRole[] = [ROLES.DUKE, ROLES.KNIGHT, ROLES.CIVILIAN]

export function UserManagementPanel() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [searchText, setSearchText] = useState("")
  const [loading, setLoading] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const { toast } = useToast()

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: "100" })
      if (searchText.trim()) params.set("q", searchText.trim())
      const res = await fetch(`/api/roles/users?${params.toString()}`)
      const data = await res.json() as { users?: ManagedUser[]; error?: string }
      if (!res.ok) throw new Error(data.error || "加载用户列表失败")
      setUsers(data.users || [])
    } catch (error) {
      toast({
        title: "加载用户失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [searchText, toast])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const updateRole = async (user: ManagedUser, roleName: ManageableRole) => {
    if (user.role === ROLES.EMPEROR) return
    setUpdatingUserId(user.id)
    try {
      const res = await fetch("/api/roles/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, roleName }),
      })
      const data = await res.json().catch(() => ({})) as { error?: string }
      if (!res.ok) throw new Error(data.error || "更新角色失败")
      setUsers(current => current.map(item => item.id === user.id ? { ...item, role: roleName } : item))
      toast({
        title: "用户角色已更新",
        description: `${user.username || user.email || user.name || user.id} -> ${roleLabels[roleName]}`,
      })
    } catch (error) {
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <div className="bg-background rounded-lg border-2 border-primary/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">用户管理</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") loadUsers()
            }}
            placeholder="搜索用户名或邮箱"
            className="pl-9"
          />
        </div>
        <Button onClick={loadUsers} disabled={loading} variant="outline" className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          刷新
        </Button>
      </div>

      <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {users.length === 0 && !loading && (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            暂无用户或没有匹配结果
          </div>
        )}

        {users.map((user) => {
          const isEmperor = user.role === ROLES.EMPEROR
          const displayName = user.username || user.name || user.email || user.id
          return (
            <div key={user.id} className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate font-medium">{displayName}</div>
                  {isEmperor && <Shield className="h-4 w-4 shrink-0 text-primary" />}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {user.email || "无邮箱"} · 已创建邮箱 {Number(user.emailCount || 0)} 个 · 当前角色 {roleLabels[(user.role || ROLES.CIVILIAN) as Role] || "未知"}
                </div>
              </div>

              {isEmperor ? (
                <Button variant="outline" size="sm" disabled>管理员不可降级</Button>
              ) : (
                <Select
                  value={(user.role || ROLES.CIVILIAN) as ManageableRole}
                  onValueChange={(value) => updateRole(user, value as ManageableRole)}
                  disabled={updatingUserId === user.id}
                >
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {manageableRoles.map((role) => {
                      const Icon = roleIcons[role]
                      return (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {roleLabels[role]}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}