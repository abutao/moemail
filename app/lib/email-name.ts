import { EMAIL_CONFIG } from "@/config"

export const FRIENDLY_EMAIL_NAMES = [
  "Aiden", "Alice", "Amelia", "Bella", "Carter", "Chloe", "Daisy", "Daniel",
  "Ethan", "Emma", "Felix", "Fiona", "Grace", "Henry", "Iris", "James",
  "Kevin", "Laura", "Liam", "Lucas", "Mason", "Mia", "Nina", "Noah",
  "Olivia", "Oscar", "Piper", "Quinn", "Ruby", "Ryan", "Sofia", "Tina",
  "Victor", "Wendy", "Zoe", "Mina", "Luna", "Nora", "Elena", "Milo"
]

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateFriendlyEmailName() {
  const totalLength = randomInt(EMAIL_CONFIG.RANDOM_EMAIL_NAME_MIN_LENGTH, EMAIL_CONFIG.RANDOM_EMAIL_NAME_MAX_LENGTH)
  const minDigits = 2
  const candidates = FRIENDLY_EMAIL_NAMES.filter(name => name.length <= totalLength - minDigits)
  const baseName = candidates[randomInt(0, candidates.length - 1)] ?? "Mina"
  const digitLength = totalLength - baseName.length
  let digits = ""

  for (let i = 0; i < digitLength; i++) {
    digits += randomInt(0, 9).toString()
  }

  return `${baseName}${digits}`
}