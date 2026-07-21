import { EMAIL_CONFIG } from "@/config"

export const normalizeDomain = (domain: string): string => domain.trim().toLowerCase()

export const parseConfiguredDomains = (domainString: string | null): string[] => {
  const configuredDomains = domainString && domainString !== "moemail.app"
    ? domainString.split(",")
    : [...EMAIL_CONFIG.DEFAULT_EMAIL_DOMAINS]

  return configuredDomains
    .map(normalizeDomain)
    .filter(Boolean)
}

export const isDomainAllowed = (
  requestedDomain: string,
  allowedDomains: string[],
): boolean => {
  const normalizedRequestedDomain = normalizeDomain(requestedDomain)

  if (!normalizedRequestedDomain || allowedDomains.length === 0) {
    return false
  }

  return allowedDomains.some((allowedDomain) => {
    return normalizedRequestedDomain === allowedDomain
      || normalizedRequestedDomain.endsWith(`.${allowedDomain}`)
  })
}
