"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Copy, Plus, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { EXPIRY_OPTIONS } from "@/types/email"
import { useCopy } from "@/hooks/use-copy"
import { useConfig } from "@/hooks/use-config"
import { generateFriendlyEmailName } from "@/lib/email-name"

interface CreateDialogProps {
  onEmailCreated: () => void
}

export function CreateDialog({ onEmailCreated }: CreateDialogProps) {
  const { config } = useConfig()
  const t = useTranslations("emails.create")
  const tList = useTranslations("emails.list")
  const tCommon = useTranslations("common.actions")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailName, setEmailName] = useState("")
  const [currentDomain, setCurrentDomain] = useState("")
  const [domainDropdownOpen, setDomainDropdownOpen] = useState(false)
  const [expiryTime, setExpiryTime] = useState(EXPIRY_OPTIONS[1].value.toString())
  const { toast } = useToast()
  const { copyToClipboard } = useCopy()

  const resolvePreferredDomain = (domains: string[]) => {
    const normalizedDomains = domains
      .map(domain => domain.trim().toLowerCase())
      .filter(Boolean)

    if (normalizedDomains.length === 0) {
      return ""
    }

    if (typeof window === "undefined") {
      return normalizedDomains[0]
    }

    const currentHost = window.location.hostname.toLowerCase()
    const matchedDomain = normalizedDomains.find(domain => domain === currentHost)

    return matchedDomain || normalizedDomains[0]
  }

  const generateRandomName = () => setEmailName(generateFriendlyEmailName())

  const copyEmailAddress = () => {
    copyToClipboard(`${emailName}@${currentDomain}`)
  }

  const createEmail = async () => {
    if (!emailName.trim()) {
      toast({
        title: tList("error"),
        description: t("namePlaceholder"),
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/emails/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: emailName,
          domain: currentDomain,
          expiryTime: parseInt(expiryTime)
        })
      })

      if (!response.ok) {
        const data = await response.json()
        toast({
          title: tList("error"),
          description: (data as { error: string }).error,
          variant: "destructive"
        })
        return
      }

      toast({
        title: tList("success"),
        description: t("success")
      })
      onEmailCreated()
      setOpen(false)
      setEmailName("")
    } catch {
      toast({
        title: tList("error"),
        description: t("failed"),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if ((config?.emailDomainsArray?.length ?? 0) > 0) {
      setCurrentDomain(resolvePreferredDomain(config?.emailDomainsArray ?? []))
    }
  }, [config])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t("title")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              value={emailName}
              onChange={(e) => setEmailName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className="flex-1"
            />
            {(config?.emailDomainsArray?.length ?? 0) > 1 && (
              <div className="relative w-[240px]">
                <button
                  type="button"
                  onClick={() => setDomainDropdownOpen(open => !open)}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-left text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <span className="truncate">@{currentDomain}</span>
                  <span className="ml-2 text-muted-foreground">?</span>
                </button>

                {domainDropdownOpen && (
                  <div className="absolute left-0 top-full z-[100] mt-1 w-[260px] rounded-md border bg-popover text-popover-foreground shadow-lg">
                    <div className="border-b px-3 py-1.5 text-xs text-muted-foreground">
                      {config?.emailDomainsArray?.length ?? 0} domains - scroll for more
                    </div>
                    <div className="max-h-56 overflow-y-auto p-1">
                      {config?.emailDomainsArray?.map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setCurrentDomain(d)
                            setDomainDropdownOpen(false)
                          }}
                          className={`block w-full rounded-sm px-3 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground ${d === currentDomain ? "bg-accent text-accent-foreground" : ""}`}
                        >
                          @{d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={generateRandomName}
              type="button"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Label className="shrink-0 text-muted-foreground">{t("expiryTime")}</Label>
            <RadioGroup
              value={expiryTime}
              onValueChange={setExpiryTime}
              className="flex gap-6"
            >
              {EXPIRY_OPTIONS.map((option, index) => {
                const labels = [t("oneHour"), t("oneDay"), t("threeDays"), t("permanent")]
                return (
                  <div key={option.value} className="flex items-center gap-2">
                    <RadioGroupItem value={option.value.toString()} id={option.value.toString()} />
                    <Label htmlFor={option.value.toString()} className="cursor-pointer text-sm">
                      {labels[index]}
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="shrink-0">{t("domain")}:</span>
            {emailName ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate">{`${emailName}@${currentDomain}`}</span>
                <div
                  className="shrink-0 cursor-pointer hover:text-primary transition-colors"
                  onClick={copyEmailAddress}
                >
                  <Copy className="size-4" />
                </div>
              </div>
            ) : (
              <span className="text-gray-400">...</span>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={createEmail} disabled={loading}>
            {loading ? t("creating") : t("create")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
