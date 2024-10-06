import { Router } from "oak/router"
import { decrypt, encrypt, replaceValue } from "./lib/utils.ts"

const router = new Router()
const decoder = new TextDecoder("utf-8")

export default router
  .get("/", async (context) => {
    const data = await Deno.readFile("index.html")
    const html = decoder.decode(data)
    context.response.headers.set("Content-Type", "text/html")
    context.response.body = html
  })
  .get("/encryption", async ({ response }) => {
    const html = await Deno.readFile("html.html")
    const head = await Deno.readFile("head.html")
    const body = await Deno.readFile("encryption.html")

    const htmlHead = replaceValue(decoder.decode(head), {
      css: "styles2.css",
      script: "encrypt.js",
    })
    const htmlBody = replaceValue(decoder.decode(body), {
      head: htmlHead,
      title: "Encrypt your secret",
      subtitle: "Encryption Page!",
    })

    response.body = replaceValue(decoder.decode(html), {
      content: htmlHead + htmlBody,
    })
  })
  .post("/encrypt", async ({ request, response }) => {
    console.log("==>", "======================== oooo")
    const res = await request.body.formData()
    const url = res.get("raw-text")
    let result = ""
    if (typeof url === "string") {
      result = encrypt(url)
    }
    response.body = result
  })
  .post("/decrypt", async ({ request, response }) => {
    const res = await request.body.formData()
    const url = res.get("encoded-txt")
    let result = ""
    if (typeof url === "string") {
      result = decrypt(url)
    }
    response.body = result
  })
