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
  .get("/form", async ({ response }) => {
    const blob = await Deno.readFile("src/html/form.html")
    console.log("==>", blob)
    response.body = decoder.decode(blob)
  })
  .get("/decryption", async ({ response }) => {
    const [_layout, _head, _gcss, _css, _body] = await Promise.all([
      Deno.readFile("src/html/layout.html"),
      Deno.readFile("src/html/head.html"),
      Deno.readFile("src/css/layout.css"),
      Deno.readFile("src/css/decryption.css"),
      Deno.readFile("src/html/pages/decryption.html"),
    ])
    const head = bindValues(decoder.decode(_head), {
      css: `<style>${decoder.decode(_gcss) + decoder.decode(_css)}</style>`,
      script: "decrypt.js",
    })
    const body = bindValues(decoder.decode(_body), {
      title: "get your stuff back",
      subtitle: "paste your encrypted key here to decode your secret",
    })

    response.headers.set("Content-Type", "text/html")
    response.body = bindValues(decoder.decode(_layout), {
      head,
      body,
    })
  })
  .get("/encryption", async ({ response }) => {
    const [_layout, _head, _gcss, _css, _body] = await Promise.all([
      Deno.readFile("src/html/layout.html"),
      Deno.readFile("src/html/head.html"),
      Deno.readFile("src/css/layout.css"),
      Deno.readFile("src/css/encryption.css"),
      Deno.readFile("src/html/pages/encryption.html"),
    ])
    const head = bindValues(decoder.decode(_head), {
      css: `<style>${decoder.decode(_gcss) + decoder.decode(_css)}</style>`,
      script: "encrypt.js",
    })
    const body = bindValues(decoder.decode(_body), {
      title: "dump your thing",
      subtitle: "turn your information into encrypted code",
    })

    response.body = bindValues(decoder.decode(_layout), {
      head,
      body,
    })
  })
  .post(
    "/encrypt",
    async (ctx) => {
      const formData = await ctx.request.body.formData()
      const text = formData.get("raw-text")

      if (typeof text !== "string") {
        ctx.throw(400, "invalid input")
      } else {
        ctx.response.body = encrypt(text)
      }
    },
  )
  .post("/decrypt", async (ctx) => {
    const formData = await ctx.request.body.formData()
    const text = formData.get("encoded-txt")

    if (typeof text !== "string") {
      ctx.throw(400, "invalid input")
    } else {
      ctx.response.body = decrypt(text)
    }
  })
