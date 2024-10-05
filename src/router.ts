import { Router } from "oak/router"
import { decrypt, encrypt } from "./lib/utils.ts"

const router = new Router()
const decoder = new TextDecoder("utf-8")

export default router
  .get("/", async (context) => {
    const data = await Deno.readFile("index.html")
    const html = decoder.decode(data)
    context.response.headers.set("Content-Type", "text/html")
    context.response.body = html
  })
  .post("/encrypt", async ({ request, response }) => {
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
