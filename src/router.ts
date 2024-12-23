import { Router } from "oak/router"
import { decrypt, encrypt } from "./lib/crypto.ts"
import { deflate, inflate } from "jsr/compress"

const stringKey = Deno.env.get("KEY")

if (!stringKey) {
  throw new Error("Key not found")
}

const router = new Router()

export default router
  .get("/(play)?", async ({ response }) => {
    response.body = await Deno.readFile("src/html/layout.html")
  })
  .post(
    "/encrypt",
    async (ctx) => {
      const textArray: string[] = await ctx.request.body.json()
      const result = await Promise.all(textArray.map((text: string) => {
        return encrypt(text, stringKey)
      }))
      const bytes = new TextEncoder().encode(result.join(","))
      const compressed = deflate(bytes)
      const compressedBase64 = btoa(String.fromCharCode(...compressed))

      ctx.response.body = compressedBase64
    },
  )
  .post("/decrypt", async (ctx) => {
    const text = await ctx.request.body.text()
    const compressedUint8Array = Uint8Array.from(
      atob(text),
      (c) => c.charCodeAt(0),
    )
    const decompressed = inflate(compressedUint8Array)
    const strArray = new TextDecoder().decode(decompressed).split(",")

    if (typeof strArray[0] !== "string") {
      ctx.throw(400, "invalid input")
    } else {
      const res = await Promise.all(strArray.map(async (t) => {
        return await decrypt(t, stringKey)
      }))

      ctx.response.body = res
    }
  })
