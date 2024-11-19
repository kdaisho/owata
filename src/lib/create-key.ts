/**
 * Create Key
 * Run only once, store the output to env file to enc/dec
 */
import { encodeBase64 } from "jsr:@std/encoding/base64"

const secretKey = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  true, // Whether the key is extractable
  ["encrypt", "decrypt"], // Key usage
)

const arrayBufferKey = await crypto.subtle.exportKey("raw", secretKey)

console.log(encodeBase64(arrayBufferKey))

// make this CLI tool
