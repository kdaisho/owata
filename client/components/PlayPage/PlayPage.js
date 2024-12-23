import { $, closeOnClickOutside, submitText } from "../../utils.js"
import { resetCss, shadowCss } from "./shadow.css.js"
import { playPageCss } from "./play-page.css.js"

export default class PlayPage extends HTMLElement {
  /**
   * @type {HTMLTextAreaElement | null }
   */
  #decryptTextarea = null

  /**
   * @type {HTMLButtonElement | null }
   */
  #decryptButton = null

  /**
   * @type {HTMLDialogElement | null }
   */
  #dialog = null

  /**
   * @type {HTMLButtonElement | null}
   */
  #importButton = null

  /**
   * @type {HTMLButtonElement | null}
   */
  #encryptButton = null

  /**
   * @type {HTMLElement | null}
   */
  #aside = null

  /**
   * @type {HTMLButtonElement | null}
   */
  #sidebarButton = null

  constructor() {
    super()

    this.root = this.attachShadow({ mode: "open" })
    this.root.adoptedStyleSheets = [resetCss, shadowCss, playPageCss]

    const template = $("#play-page-template")
    if (!(template instanceof HTMLTemplateElement)) return
    const content = template.content.cloneNode(true)
    if (!(content instanceof Node)) return
    this.root.appendChild(content)
  }

  connectedCallback() {
    document.startViewTransition
      ? document.startViewTransition(() => this.#render())
      : this.#render()

    this.#setupSubmit()
  }

  #render() {
    this.#importButton = document.$el("button")
    this.#encryptButton = document.$el("button")
    this.#sidebarButton = document.$el("button")

    this.#importButton.innerText = "import"
    this.#encryptButton.innerText = "encrypt"
    this.#sidebarButton.classList.add("icon-btn")

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

    const cancelButton = document.$el("button")
    cancelButton.$attr("type", "button")
    cancelButton.innerText = "cancel"
    const addButton = document.$el("button")
    addButton.$attr("type", "button")
    addButton.innerText = "add"

    addButton.$on(
      "click",
      () => {
        const value = urlInput.value.trim()
        if (!value) return
        app.store.rawText = [value, ...app.store.rawText]
        urlInput.value = ""
      },
    )

    const div = document.$el("div")
    div.classList.add("top-nav")
    div.append(this.#importButton, this.#encryptButton)

    const form = document.$el("form")
    form.append(urlFieldset, nameFieldset, cancelButton, addButton)

    this.#aside = document.$el("aside")
    this.#aside.append(this.#sidebarButton)
    this.#aside.append(form)

    const section = this.root.$("section")
    if (!(section instanceof HTMLElement)) return
    section.append(div, this.#aside)

    this.#sidebarButton?.$on("click", () => {
      this.#aside?.classList.toggle("active")
    })

    this.#setSubmit()
  }

  // #populateList() {
  //   // const document.$el("textarea")
  //   document.$on("addrawtext", () => {
  //     console.log("==> ADDED", app.store.rawText)
  //   })
  // }

  #setSubmit() {
    console.log("==> NOPE?", this.#encryptButton)
    this.#encryptButton?.$on("click", async () => {
      console.log("==>", app.store.rawText)
      const response = await fetch("/encrypt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(app.store.rawText),
      })
      console.log("==> RES", await response.text())
      // const urlInput = this.root.$('input[name="url"]')
      // if (!(urlInput instanceof HTMLTextAreaElement)) return
      // textarea.classList.add("output")
      // textarea.value = await response.text()

      // this.root.$("section")?.append(textarea)
      this.#renderCopyButton()
    })
  }

  #renderCopyButton() {
    const btn = document.$el("button")
    btn.textContent = "Copy to clipboard"
    btn.$on("click", () => {
      const textarea = this.root.$("textarea.output")
      if (!(textarea instanceof HTMLTextAreaElement)) return
      navigator.clipboard.writeText(textarea.value)
        .then(() => console.log("Copied successfully!"))
        .catch((err) => console.error("Copy failed:", err))
    })
    this.root.$("section")?.append(btn)
  }

  /**
   * @param {string[]} data
   */
  #renderList(data) {
    const ul = document.$el("ul")
    for (const item of data) {
      const li = `
        <li>
          <a href=${item} target="_blank" rel="noopener noreferrer">${item}</a>
        </li>
      `
      ul.insertAdjacentHTML("beforeend", li)
    }
    this.root.$("section")?.append(ul)
  }

  #setupSubmit() {
    if (!(this.#decryptButton instanceof HTMLButtonElement)) return

    this.#decryptButton.$on("click", async () => {
      if (!(this.#decryptTextarea?.value)) return
      this.#renderList(
        await submitText(this.#decryptTextarea.value, "/decrypt"),
      )
    })
  }
}

customElements.define("play-page", PlayPage)
