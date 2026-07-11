export const EMAIL_CONFIG = {
  MAX_ACTIVE_EMAILS: 30, // Maximum number of active emails
  POLL_INTERVAL: 10_000, // Polling interval in milliseconds
  DEFAULT_EMAIL_DOMAINS: [
    "ailinkr.one",
    "mail.ailinkr.one",
    "team.ailinkr.one",
    "support.ailinkr.one",
    "api.ailinkr.one",
    "dev.ailinkr.one",
    "app.ailinkr.one",
    "blog.ailinkr.one",
    "admin.ailinkr.one",
    "static.ailinkr.one",
    "beta.ailinkr.one",
    "doc.ailinkr.one",
    "en.ailinkr.one",
    "adidsi.ailinkr.one",
    "foraad.ailinkr.one",
    "jiujie.ailinkr.one",
    "jjwwye.ailinkr.one",
    "liulaohan.ailinkr.one",
    "more.ailinkr.one",
  ],
  RANDOM_EMAIL_NAME_MIN_LENGTH: 10, // Minimum length of generated mailbox names
  RANDOM_EMAIL_NAME_MAX_LENGTH: 16, // Maximum length of generated mailbox names
  DEFAULT_DAILY_SEND_LIMITS: {
    emperor: 0,   // 皇帝无限制
    duke: 5,      // 公爵每日5封
    knight: 2,    // 骑士每日2封
    civilian: -1, // 平民禁止发件
  },
} as const

export type EmailConfig = typeof EMAIL_CONFIG 