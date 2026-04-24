// Gerador de BR Code EMV para PIX (estatico ou dinamico).
// Segue o padrao do Manual de Padroes PIX (BACEN).
// Compativel com apps bancarios brasileiros (Itau, Bradesco, Nubank, etc.).

export interface PixPayloadInput {
  pixKey: string
  beneficiaryName: string
  beneficiaryCity: string
  amount?: number
  txid?: string
  description?: string
}

function tlv(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0')
  return `${id}${length}${value}`
}

function sanitize(text: string, maxLength: number): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .trim()
    .slice(0, maxLength)
    .toUpperCase()
}

function sanitizeTxid(text: string): string {
  const cleaned = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 25)
  return cleaned || '***'
}

function crc16ccitt(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff
      } else {
        crc = (crc << 1) & 0xffff
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export function generatePixPayload(input: PixPayloadInput): string {
  const pixKey = input.pixKey.trim()
  if (!pixKey) {
    return ''
  }

  const name = sanitize(input.beneficiaryName || 'RECEBEDOR', 25)
  const city = sanitize(input.beneficiaryCity || 'SAO PAULO', 15)
  const txid = sanitizeTxid(input.txid ?? '***')

  let merchantInfo = tlv('00', 'br.gov.bcb.pix') + tlv('01', pixKey)
  if (input.description) {
    const desc = sanitize(input.description, 40)
    if (desc) {
      merchantInfo += tlv('02', desc)
    }
  }

  const additional = tlv('05', txid)

  let payload =
    tlv('00', '01') +
    tlv('26', merchantInfo) +
    tlv('52', '0000') +
    tlv('53', '986')

  if (input.amount && input.amount > 0) {
    payload += tlv('54', input.amount.toFixed(2))
  }

  payload +=
    tlv('58', 'BR') +
    tlv('59', name) +
    tlv('60', city) +
    tlv('62', additional) +
    '6304'

  const crc = crc16ccitt(payload)
  return payload + crc
}

export function generateTxid(prefix = 'OB'): string {
  const timePart = Date.now().toString(36).toUpperCase()
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}${timePart}${randomPart}`.slice(0, 25)
}
