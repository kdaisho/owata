import { Application } from "oak/application"
import router from "./src/router.ts"

const app = new Application()

app.use(async (context, next) => {
  try {
    await context.send({
      root: `${Deno.cwd()}/static`,
      index: "index.html",
    })
  } catch {
    await next()
  }
})
app.use(router.routes())
app.use(router.allowedMethods())
app.use((context) => {
  if (context.response.status === 404) {
    context.response.status = 404
    context.response.body = { message: "Not Found" }
  }
})

await app.listen({ port: 8000 })
