import { Router } from "oak/router"
import { bindValues } from "./lib/utils.ts"
import { decrypt, encrypt } from "./lib/crypto.ts"

const stringKey = Deno.env.get("KEY")

if (!stringKey) {
  throw new Error("Key not found")
}

const router = new Router()
const decoder = new TextDecoder("utf-8")
const dev = Deno.env.get("ENV") === "development"
const cache = {
  main: "",
  modal: "",
}

export default router
  .get("/(encryption)?", async ({ response }) => {
    if (dev || !cache.main) {
      const [_layout, _head, _gcss, _css, _main] = await Promise.all([
        Deno.readFile("src/html/layout.html"),
        Deno.readFile("src/html/head.html"),
        Deno.readFile("src/css/layout.css"),
        Deno.readFile("src/css/main.css"),
        Deno.readFile("src/html/main.html"),
      ])
      cache.main = bindValues(decoder.decode(_layout), {
        head: bindValues(decoder.decode(_head), {
          css: `<style>${decoder.decode(_gcss) + decoder.decode(_css)}</style>`,
        }),
        main: decoder.decode(_main),
      })
    }

    response.body = cache.main
  })
  .post("/form", async ({ request, response }) => {
    if (dev || !cache.modal) {
      const { action, label, buttonLabel, isEncryption } = await request.body
        .json()

      cache.modal = bindValues(
        decoder.decode(await Deno.readFile("src/html/modal.html")),
        {
          action,
          label,
          buttonLabel,
          isEncryption,
        },
      )
    }

    response.body = cache.modal
  })
  .get("/output", async ({ response }) => {
    response.body = decoder.decode(await Deno.readFile("src/html/output.html"))
  })
  .post(
    "/encrypt",
    async (ctx) => {
      console.log("==> YO", ctx.request.body)
      const textArray = await ctx.request.body.json()
      console.log("==> YO2", { textArray })

      if (typeof textArray[0] !== "string") {
        ctx.throw(400, "invalid input")
      } else {
        const res = await encrypt(textArray[0], stringKey)
        console.log("==>", { res })
        ctx.response.body = res
      }
    },
  )
  .post("/decrypt", async (ctx) => {
    const text = await ctx.request.body.text()

    if (typeof text !== "string") {
      ctx.throw(400, "invalid input")
    } else {
      ctx.response.body = await decrypt(text, stringKey)
    }
  })
