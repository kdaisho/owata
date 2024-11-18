import { decodeBase64, encodeBase64 } from "jsr:@std/encoding/base64"

const stringKey = Deno.env.get("KEY")
const stringIv = Deno.env.get("IV")

if (!stringKey || !stringIv) {
  throw new Error("key not found")
}

const arrayBufferKey = decodeBase64(stringKey).buffer

const cryptKey = await crypto.subtle.importKey(
  "raw",
  arrayBufferKey,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt", "decrypt"],
)

export async function encrypt(input: string): Promise<string> {
  if (!stringIv) {
    throw new Error("iv not found")
  }
  const encrypted = await encryptData(input, decodeBase64(stringIv), cryptKey)
  return bufferToString(encrypted)
}

async function encryptData(
  input: string,
  iv: Uint8Array,
  key: CryptoKey,
) {
  const buffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(input),
  )
  return { buffer, iv } // Give user encrypted data with iv for decryption
}

export async function decrypt(input: string): Promise<string> {
  const buffer = stringToBuffer(input)
  return await decryptData(buffer.value, buffer.iv, cryptKey)
}

async function decryptData(
  buffer: ArrayBufferLike,
  iv: Uint8Array,
  key: CryptoKey,
) {
  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    buffer,
  )
  return new TextDecoder().decode(decryptedData)
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
