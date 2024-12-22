import Router from "../services/Router.js"
import Store from "../services/Store.js"

globalThis.app = {}
app.router = Router
app.store = Store

document.$on("DOMContentLoaded", () => {
  app.router.init()
})
