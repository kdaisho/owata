import { Router } from "oak/router"
import { bindValues } from "./lib/utils.ts"
import { decrypt, encrypt } from "./lib/crypto.ts"
import { deflate, inflate } from "jsr/compress"

const stringKey = Deno.env.get("KEY")

if (!stringKey) {
  throw new Error("Key not found")
}

const router = new Router()
const decoder = new TextDecoder("utf-8")
const dev = Deno.env.get("ENV") === "development"
const cache = {
  main: "",
}

export default router
  .get("/", async ({ response }) => {
    if (dev || !cache.main) {
      const [layoutHtml, headHtml, homeHtml, resetCss, appCss, homeCss] =
        await Promise.all([
          Deno.readFile("src/html/layout.html"),
          Deno.readFile("src/html/head.html"),
          Deno.readFile("src/html/home.html"),
          Deno.readFile("client/css/reset.css"),
          Deno.readFile("src/css/app.css"),
          Deno.readFile("src/css/home.css"),
        ])
      cache.main = bindValues(decoder.decode(layoutHtml), {
        head: bindValues(decoder.decode(headHtml), {
          css: `<style>${
            decoder.decode(resetCss) + decoder.decode(appCss) +
            decoder.decode(homeCss)
          }</style>`,
        }),
        main: decoder.decode(homeHtml),
      })
    }

    response.body = cache.main
  })
  .get("/decryption", async ({ response }) => {
    if (dev || !cache.main) {
      const [layoutHtml, headHtml, resetCss, appCss] = await Promise.all([
        Deno.readFile("src/html/layout.html"),
        Deno.readFile("src/html/head.html"),
        Deno.readFile("client/css/reset.css"),
        Deno.readFile("src/css/app.css"),
      ])
      cache.main = bindValues(decoder.decode(layoutHtml), {
        head: bindValues(decoder.decode(headHtml), {
          css: `<style>${
            decoder.decode(resetCss) + decoder.decode(appCss)
          }</style>`,
        }),
        main: "",
      })
    }

    response.body = cache.main
  })
  .get("/encryption", async ({ response }) => {
    if (dev || !cache.main) {
      const [layoutHtml, headHtml, resetCss, appCss, homeCss] = await Promise
        .all([
          Deno.readFile("src/html/layout.html"),
          Deno.readFile("src/html/head.html"),
          Deno.readFile("client/css/reset.css"),
          Deno.readFile("src/css/app.css"),
          Deno.readFile("src/css/home.css"),
        ])
      cache.main = bindValues(decoder.decode(layoutHtml), {
        head: bindValues(decoder.decode(headHtml), {
          css: `<style>${
            decoder.decode(resetCss) + decoder.decode(appCss) +
            decoder.decode(homeCss)
          }</style>`,
        }),
        main: "",
      })
    }

    response.body = cache.main
  })
  .get("/output", async ({ response }) => {
    response.body = decoder.decode(await Deno.readFile("src/html/output.html"))
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
