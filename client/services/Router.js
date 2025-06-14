import { $, $$ } from "../utils.js"

const Router = {
  init: () => {
    $$("a.navlink")?.forEach((a) => {
      /**
       * @param {MouseEvent} event
       */
      a.$on("click", (event) => {
        event.preventDefault()
        if (!(event.target instanceof HTMLElement)) return
        Router.goto(event.target.getAttribute("href") || "")
      })
    })
    // listen for history changes
    globalThis.$on("popstate", (event) => {
      Router.goto(event.state.route, false)
    })

    Router.goto(location.pathname)
  },

  /**
   * @param {string} route
   * @param {boolean} addToHistory
   */
  goto: async (route, addToHistory = true) => {
    if (addToHistory) {
      history.pushState({ route }, "", route)
    }

    switch (route) {
      case "/": {
        await import("../components/HomePage.js")

        const main = $("main")
        if (!main) throw new Error("main elem not found")
        main.innerHTML = ""
        main?.appendChild(document.$el("home-page"))
        break
      }
      case "/crypto": {
        await import("../components/CryptoPage.js")

        const main = $("main")
        if (!main) throw new Error("main elem not found")
        main.innerHTML = ""
        main?.appendChild(document.$el("crypto-page"))
        break
      }
      default:
        break
    }

    globalThis.scrollX = 0
  },
}

export default Router
