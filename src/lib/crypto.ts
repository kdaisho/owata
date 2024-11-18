import { decodeBase64, encodeBase64 } from "jsr:@std/encoding/base64"

const stringKey = Deno.env.get("KEY")

if (!stringKey) {
  throw new Error("key not found")
}

export async function encrypt(input: string): Promise<string> {
  const randomUint8 = crypto.getRandomValues(new Uint8Array(16))
  const cryptKey = await crypto.subtle.importKey(
    "raw",
    randomUint8.buffer,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  )
  const encrypted = await encryptData(input, randomUint8, cryptKey)
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
  const cryptKey = await crypto.subtle.importKey(
    "raw",
    buffer.iv,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  )
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
