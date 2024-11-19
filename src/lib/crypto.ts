import { decodeBase64, encodeBase64 } from "jsr:@std/encoding/base64"

async function importKey(stringKey: string): Promise<CryptoKey> {
  const rawKey = decodeBase64(stringKey)
  return await crypto.subtle.importKey(
    "raw",
    rawKey.buffer,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"],
  )
}

export async function encrypt(
  input: string,
  stringKey: string,
): Promise<string> {
  const randomUint8 = crypto.getRandomValues(new Uint8Array(16))
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: randomUint8 },
    await importKey(stringKey),
    new TextEncoder().encode(input),
  )
  return bufferToString({ buffer: encryptedBuffer, iv: randomUint8 })
}

export async function decrypt(
  input: string,
  stringKey: string,
): Promise<string> {
  const { value, iv } = stringToBuffer(input)
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    await importKey(stringKey),
    value,
  )
  return new TextDecoder().decode(decryptedBuffer)
}

function bufferToString(encrypted: { buffer: ArrayBuffer; iv: Uint8Array }) {
  return btoa(JSON.stringify({
    value: encodeBase64(encrypted.buffer),
    iv: encodeBase64(encrypted.iv),
  }))
}

function stringToBuffer(value: string) {
  const parsed = JSON.parse(atob(value))
  return {
    value: decodeBase64(parsed.value).buffer,
    iv: decodeBase64(parsed.iv),
  }
}
