import { $, closeOnClickOutside, submit, toast } from "../utils.js"
import("../services/Store.js")

export default class PlayPage extends HTMLElement {
  constructor() {
    super()

    this.root = this.attachShadow({ mode: "open" })

    for (const name of ["reset", "play"]) {
      const link = document.$el("link")
      link.rel = "stylesheet"
      link.href = `css/${name}.css`
      this.root.append(link)
    }

    const template = $("#play-page-template")
    if (!(template instanceof HTMLTemplateElement)) return
    const content = template.content.cloneNode(true)
    if (!(content instanceof Node)) return
    this.root.appendChild(content)
  }

  connectedCallback() {
    document.startViewTransition
      ? document.startViewTransition(() => this.render())
      : this.render()
    this.populateList()
    this.setSubmit()
    this.import()
  }

  render() {
    const urlLabel = document.$el("label")
    const urlInput = document.$el("input")
    urlInput.$attr("type", "url")
    urlInput.$attr("name", "url")
    urlLabel.innerText = "url"
    const nameLabel = document.$el("label")
    const nameInput = document.$el("input")
    urlInput.$attr("name", "name")
    nameLabel.innerText = "name (optional)"

    const urlFieldset = document.$el("fieldset")
    urlFieldset.append(urlLabel, urlInput)
    const nameFieldset = document.$el("fieldset")
    nameFieldset.append(nameLabel, nameInput)

    const addButton = document.$el("button")
    addButton.$attr("type", "button")
    addButton.innerText = "add"

    const form = document.$el("form")
    form.append(urlFieldset, nameFieldset, addButton)

    const aside = this.root.$("aside")
    if (!aside) return

    aside.append(form)

    form.$on("keydown", (e) => {
      if (e.key === "Enter") {
        this.add(urlInput, nameInput)
        urlInput.focus()
      }
      if (e.key === "Escape") {
        aside.classList.remove("active")
      }
    })

    addButton.$on(
      "click",
      () => {
        this.add(urlInput, nameInput)
        urlInput.focus()
      },
    )

    const section = this.root.$("section")
    if (!(section instanceof HTMLElement)) return

    section.hidden = false
    const toggle = this.root.$(".icon-btn")
    if (!toggle) return

    toggle.$on("click", () => {
      aside.classList.toggle("active")
      urlInput.focus()
    })
  }

  /**
   * @param {HTMLInputElement} urlInput
   * @param {HTMLInputElement} nameInput
   */
  add(urlInput, nameInput) {
    const url = urlInput.value.trim()
    const name = nameInput.value.trim()
    if (!url) return
    app.store.hyperlinks = [{ url, name }, ...app.store.hyperlinks]
    urlInput.value = ""
    nameInput.value = ""
  }

  import() {
    const importBtn = this.root.$("#import")
    const template = $("#dialog-template")
    if (!(template instanceof HTMLTemplateElement)) return

    importBtn?.$on("click", () => {
      this.root.append(template?.content.cloneNode(true))
      const dialog = this.root.$("dialog")
      if (!(dialog instanceof HTMLDialogElement)) return

      dialog.showModal()

      const textarea = this.root.$("#dialog-textarea")
      const decryptBtn = this.root.$("#dialog-btn")
      if (!(textarea instanceof HTMLTextAreaElement) || !decryptBtn) return

      decryptBtn.innerText = "decrypt"

      decryptBtn.$on("click", async () => {
        const value = textarea.value.trim()
        if (!value) return

        /**
         * @type {string[]}
         */
        let data = []
        if (
          !app.store.hyperlinks.length ||
          (app.store.hyperlinks.length && "prompted" in decryptBtn.dataset)
        ) {
          data = await submit(value, "/decrypt")
          delete decryptBtn.dataset.prompted
        } else if (app.store.hyperlinks.length) {
          decryptBtn.dataset.prompted = ""
          decryptBtn.innerText = "list already exist. want to overwrite?"
          return
        }

        console.log("==> DATA", data)

        const links = this.root.$(".links")
        links?.replaceChildren()
        app.store.hyperlinks = data.map((d) => JSON.parse(d))
        toast("success", "successfully decrypted!")
        dialog.close()
      })

      dialog.$on(
        "click",
        /** @type {(event: MouseEvent) => void} */ (event) => {
          closeOnClickOutside(event, dialog)
        },
        { once: true },
      )

      dialog.$on("close", () => {
        this.root.removeChild(dialog)
      })
    })
  }

  populateList() {
    const links = this.root.$(".links")

    document.$on("link:prepend", () => {
      let url = ""
      try {
        url = (new URL(app.store.hyperlinks[0].url)).toString()
      } catch (_) { /* do nothing */ }
      if (!links) return

      console.log("==> L", { links })

      links?.insertAdjacentHTML(
        "afterbegin",
        /*html*/ `
        <li>
          ${
          url
            ? /*html*/ `
              <a href=${url} target="_blank" rel="noopener noreferrer">${url}</a><span>${
              app.store.hyperlinks[0].name
            }</span>
            `
            : /*html*/ `
              <span>${app.store.hyperlinks[0].url}</span><span>${
              app.store.hyperlinks[0].name
            }</span>
            `
        }
        </li>
      `,
      )
    })

    document.$on("link:iterate", () => {
      if (!links) return
      links.innerHTML = ""

      app.store.hyperlinks.forEach((link) => {
        let url = ""
        try {
          url = (new URL(link.url)).toString()
        } catch (_) { /* do nothing */ }

        links.innerHTML += /*html*/ `
        <li>
          ${
          url
            ? /*html*/ `
              <a href=${url} target="_blank" rel="noopener noreferrer">${url}</a><span>${link.name}</span>
            `
            : /*html*/ `
              <span>${link.url}</span><span>${link.name}</span>
            `
        }
        </li>
      `
      })
    })
  }

  setSubmit() {
    const encryptBtn = this.root.$("#encrypt")
    if (!encryptBtn) return

    encryptBtn.$on("click", async () => {
      const hyperlinks = app.store.hyperlinks
      if (!hyperlinks.length) {
        toast("warn", "create a list first")
        return
      }
      const response = await fetch("/encrypt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hyperlinks),
      })

      const template = $("#dialog-template")

      if (!(template instanceof HTMLTemplateElement)) return
      this.root.append(template?.content.cloneNode(true))

      const dialog = this.root.$("dialog")
      const textarea = this.root.$("#dialog-textarea")
      if (
        !(textarea instanceof HTMLTextAreaElement) ||
        !(dialog instanceof HTMLDialogElement)
      ) return
      dialog.id = "copy-encryption-value"

      textarea.innerText = await response.text()

      const copyBtn = dialog.$("button")
      if (!copyBtn) return
      copyBtn.innerText = "copy"
      copyBtn.$on("click", () => {
        navigator.clipboard.writeText(textarea.value).then(() => {
          console.info("copied successfully!")
          const temp = copyBtn.innerText
          copyBtn.innerText = "copied!"
          setTimeout(() => {
            copyBtn.innerText = temp
          }, 750)
        }).catch((err) => console.error("copy failed", err))
      })

      dialog.showModal()

      dialog.$on(
        "click",
        /** @type {(event: MouseEvent) => void} */ (event) => {
          closeOnClickOutside(event, dialog)
        },
        { once: true },
      )

      dialog.$on("close", () => {
        this.root.removeChild(dialog)
      })
    })
  }
}

customElements.define("play-page", PlayPage)
