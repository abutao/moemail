import { getRequestContext } from "@cloudflare/next-on-pages"

/**
 * 是否允许用户名密码注册。
 * 未配置时默认关闭，需在网站配置中显式开启。
 */
export async function isRegistrationEnabled(): Promise<boolean> {
  const value = await getRequestContext().env.SITE_CONFIG.get("REGISTRATION_ENABLED")
  return value === "true"
}
