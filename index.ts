import { Application } from "oak/application"
import { isHttpError } from "oak/commons/http_errors"
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
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    if (isHttpError(err)) {
      ctx.throw(err.status, err.message)
    }
    throw err
  }
})

await app.listen({ port: 8000 })
