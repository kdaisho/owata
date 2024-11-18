// Run only once, store the output to env file to enc/dec

import { encodeBase64 } from "jsr:@std/encoding/base64"

const key = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  true, // Whether the key is extractable
  ["encrypt"], // Key usage
)

const arrayBufferKey = await crypto.subtle.exportKey("raw", key)
const stringKey = encodeBase64(arrayBufferKey)

console.log("To store", { stringKey })

const iv = crypto.getRandomValues(new Uint8Array(12))
const stringIv = encodeBase64(iv)

console.log("To store", { stringIv })
