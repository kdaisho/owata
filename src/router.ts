import { Router } from "oak/router"
import { bindValues, decrypt, encrypt } from "./lib/utils.ts"

const router = new Router()
const decoder = new TextDecoder("utf-8")
const dev = Deno.env.get("ENV") === "development"
const cache = {
  main: "",
  modal: "",
}

export default router
  .get("/", async ({ response }) => {
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
        decoder.decode(await Deno.readFile("src/html/form.html")),
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
  .post(
    "/encrypt",
    async (ctx) => {
      const formData = await ctx.request.body.formData()
      const text = formData.get("input-value")

      if (typeof text !== "string") {
        ctx.throw(400, "invalid input")
      } else {
        ctx.response.body = encrypt(text)
      }
    },
  )
  .post("/decrypt", async (ctx) => {
    const formData = await ctx.request.body.formData()
    const text = formData.get("input-value")

    if (typeof text !== "string") {
      ctx.throw(400, "invalid input")
    } else {
      ctx.response.body = decrypt(text)
    }
  })
