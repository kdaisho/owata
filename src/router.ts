import { Router } from "oak/router"
import { bindValues, decrypt, encrypt } from "./lib/utils.ts"

const router = new Router()
const decoder = new TextDecoder("utf-8")

export default router
  .get("/", async ({ response }) => {
    const [_layout, _head, _gcss, _css, _main] = await Promise.all([
      Deno.readFile("src/html/layout.html"),
      Deno.readFile("src/html/head.html"),
      Deno.readFile("src/css/layout.css"),
      Deno.readFile("src/css/main.css"),
      Deno.readFile("src/html/main.html"),
    ])
    const head = bindValues(decoder.decode(_head), {
      css: `<style>${decoder.decode(_gcss) + decoder.decode(_css)}</style>`,
      script: "main.js",
    })

    response.headers.set("Content-Type", "text/html")
    response.body = bindValues(decoder.decode(_layout), {
      head,
      main: decoder.decode(_main),
    })
  })
  .post("/get-form", async ({ request, response }) => {
    const { action, label, buttonLabel, isEncryption } = await request.body
      .json()
    const blob = await Deno.readFile("src/html/form.html")
    response.body = bindValues(decoder.decode(blob), {
      action,
      label,
      buttonLabel,
      isEncryption,
    })
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
