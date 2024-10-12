import { Router } from "oak/router"
import { decrypt, encrypt, render } from "./lib/utils.ts"

const router = new Router()
const decoder = new TextDecoder("utf-8")

export default router
  .get("/", ({ response }) => {
    response.redirect("/decryption")
  })
  .get("/decryption", async ({ response }) => {
    const [_layout, _head, _gcss, _css, _body] = await Promise.all([
      Deno.readFile("src/html/layout.html"),
      Deno.readFile("src/html/head.html"),
      Deno.readFile("src/css/global.css"),
      Deno.readFile("src/css/decryption.css"),
      Deno.readFile("src/html/pages/decryption.html"),
    ])
    const head = render(decoder.decode(_head), {
      css: `<style>${decoder.decode(_gcss) + decoder.decode(_css)}</style>`,
      script: "decrypt.js",
    })
    const body = render(decoder.decode(_body), {
      title: "get your stuff back",
      subtitle: "paste your encrypted key here to decode your secret",
    })

    response.headers.set("Content-Type", "text/html")
    response.body = render(decoder.decode(_layout), {
      head,
      body,
    })
  })
  .get("/encryption", async ({ response }) => {
    const [_layout, _head, _gcss, _css, _body] = await Promise.all([
      Deno.readFile("src/html/layout.html"),
      Deno.readFile("src/html/head.html"),
      Deno.readFile("src/css/global.css"),
      Deno.readFile("src/css/encryption.css"),
      Deno.readFile("src/html/pages/encryption.html"),
    ])
    const head = render(decoder.decode(_head), {
      css: `<style>${decoder.decode(_gcss) + decoder.decode(_css)}</style>`,
      script: "encrypt.js",
    })
    const body = render(decoder.decode(_body), {
      title: "dump your thing",
      subtitle: "turn your information into encrypted code",
    })

    response.body = render(decoder.decode(_layout), {
      head,
      body,
    })
  })
  .post("/encrypt", async (ctx) => {
    const formData = await ctx.request.body.formData()
    const text = formData.get("raw-text")

    if (typeof text !== "string") {
      ctx.throw(400, "invalid input")
    } else {
      ctx.response.body = encrypt(text)
    }
  })
  .post("/decrypt", async (ctx) => {
    const formData = await ctx.request.body.formData()
    const text = formData.get("encoded-txt")

    if (typeof text !== "string") {
      ctx.throw(400, "invalid input")
    } else {
      ctx.response.body = decrypt(text)
    }
  })
