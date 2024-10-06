import { Router } from "oak/router"
import { decrypt, encrypt, render } from "./lib/utils.ts"

const router = new Router()
const decoder = new TextDecoder("utf-8")
const _layout = await Deno.readFile("src/html/layout.html")

export default router
  .get("/", async ({ response }) => {
    const [_head, _body] = await Promise.all([
      Deno.readFile("src/html/head.html"),
      Deno.readFile("src/html/pages/decryption.html"),
    ])
    const head = render(decoder.decode(_head), {
      css: "styles.css",
      script: "decrypt.js",
    })
    const body = render(decoder.decode(_body), {
      title: "Hey",
      subtitle: "Home Page",
    })

    response.headers.set("Content-Type", "text/html")
    response.body = render(decoder.decode(_layout), {
      head,
      body,
    })
  })
  .get("/encryption", async ({ response }) => {
    const [_head, _body] = await Promise.all([
      Deno.readFile("src/html/head.html"),
      Deno.readFile("src/html/pages/encryption.html"),
    ])
    const head = render(decoder.decode(_head), {
      css: "styles2.css",
      script: "encrypt.js",
    })
    const body = render(decoder.decode(_body), {
      title: "Encrypt your secret",
      subtitle: "Encryption Page!",
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
