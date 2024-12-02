import Router from "../services/Router.js"
import Store from "../services/Store.js"

globalThis.app = {}
app.router = Router
app.store = Store

globalThis.addEventListener("DOMContentLoaded", () => {
  app.router.init()
  // loadData()
})
