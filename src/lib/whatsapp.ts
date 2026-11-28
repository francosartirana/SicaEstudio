export const DEFAULT_WHATSAPP_NUMBER = '5493416874501'

export function getWhatsAppNumber(): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER
  const digits = raw.replace(/\D/g, '')
  return digits || DEFAULT_WHATSAPP_NUMBER
}

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(message)}`
}
