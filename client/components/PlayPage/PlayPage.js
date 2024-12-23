import { $, closeOnClickOutside, submitText } from "../../utils.js"
import { resetCss, shadowCss } from "../../js/shadow.css.js"
import { playPageCss } from "../../js/play-page.css.js"

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
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.#init()
      })
    } else {
      this.#init()
    }
    this.#setupSubmit()
  }

  #init() {
    this.#importButton = document.$el("button")
    this.#encryptButton = document.$el("button")
    this.#sidebarButton = document.$el("button")

    this.#importButton.innerText = "import"
    this.#encryptButton.innerText = "encrypt"
    this.#sidebarButton.classList.add("icon-btn")

    const urlInput = document.$el("input")
    urlInput.$attr("type", "url")
    const urlLabel = document.$el("label")
    urlLabel.innerText = "url"
    const nameInput = document.$el("input")
    const nameLabel = document.$el("label")
    nameLabel.innerText = "name (optional)"

    const urlFieldset = document.$el("fieldset")
    urlFieldset.append(urlLabel, urlInput)
    const nameFieldset = document.$el("fieldset")
    nameFieldset.append(nameLabel, nameInput)

    const cancelButton = document.$el("button")
    cancelButton.innerText = "cancel"
    const addButton = document.$el("button")
    addButton.innerText = "add"

    const form = document.$el("form")
    form.append(urlFieldset, nameFieldset, cancelButton, addButton)

    const aside = document.$el("aside")
    aside.append(this.#sidebarButton)
    aside.append(form)

    const div = document.$el("div")
    div.classList.add("top-nav")
    div.append(this.#importButton, this.#encryptButton)

    const section = this.root.$("section")
    if (!(section instanceof HTMLElement)) return
    section.append(div, aside)

    this.#sidebarButton.$on("click", () => {
      aside.classList.toggle("active")
    })
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
