const Router = {
  init: () => {
    document.querySelectorAll("a.navlink").forEach((a) => {
      /**
       * @param {MouseEvent} event
       */
      a.addEventListener("click", (event) => {
        event.preventDefault()
        if (!(event.target instanceof HTMLElement)) return
        Router.goto(event.target.getAttribute("href") || "")
      })
    })
    // It listen for history changes
    globalThis.addEventListener("popstate", (event) => {
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
    /**
     * @type {HTMLElement | null}
     */
    let pageElement = null
    switch (route) {
      case "/": {
        await import(
          "../components/HomePage/HomePage.js"
        )

        const main = document.querySelector("main")
        if (!main) throw new Error("main elem not found")
        main.innerHTML = ""
        main?.appendChild(document.createElement("home-page"))
        break
      }
      case "/encryption": {
        await import(
          "../components/EncryptionPage/EncryptionPage.js"
        )

        const main = document.querySelector("main")
        if (!main) throw new Error("main elem not found")
        main.innerHTML = ""
        main?.appendChild(document.createElement("encryption-page"))
        break
      }
      case "/decryption": {
        await import(
          "../components/DecryptionPage/DecryptionPage.js"
        )

        const main = document.querySelector("main")
        if (!main) throw new Error("main elem not found")
        main.innerHTML = ""
        main?.appendChild(document.createElement("decryption-page"))
        break
      }
      default:
        break
    }
    // if (pageElement) {
    //   function changePage() {
    //     // get current page element
    //     let currentPage = document.querySelector("main").firstElementChild
    //     if (currentPage) {
    //       currentPage.remove()
    //       document.querySelector("main").appendChild(pageElement)
    //     } else {
    //       document.querySelector("main").appendChild(pageElement)
    //     }
    //   }
    //   if (!document.startViewTransition) {
    //     changePage()
    //   } else {
    //     document.startViewTransition(() => changePage())
    //   }
    // }

    globalThis.scrollX = 0
  },
  // setMetadata(section, color) {
  //   document.title = `${section} - Coffee Masters`
  //   document.querySelector("meta[name=theme-color]").content = color
  // },
}

export default Router
