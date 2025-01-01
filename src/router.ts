import { Router } from "oak/router"
import { decrypt, encrypt } from "./lib/crypto.ts"
import { deflate, inflate } from "jsr/compress"
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts"

const env = config()
const stringKey = env.KEY

if (!stringKey) {
  throw new Error("Ah, key not found")
}

const router = new Router()

export default router
  .get("/(crypto)?", async ({ response }) => {
    response.body = await Deno.readFile("src/html/layout.html")
  })
  .post(
    "/encrypt",
    async (ctx) => {
      const textArray: { url: string; name: string }[] = await ctx.request.body
        .json()
      const result = await Promise.all(
        textArray.map((data: { url: string; name: string }) => {
          return encrypt(JSON.stringify(data), stringKey)
        }),
      )
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
