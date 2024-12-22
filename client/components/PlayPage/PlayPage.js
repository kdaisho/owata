import { $, closeOnClickOutside, submitText } from "../../utils.js"
import { resetCss, shadowCss } from "../../js/shadow.css.js"

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

  constructor() {
    super()

    this.root = this.attachShadow({ mode: "open" })
    this.root.adoptedStyleSheets = [resetCss, shadowCss]

    const template = $("#play-page-template")
    if (!(template instanceof HTMLTemplateElement)) return
    const content = template.content.cloneNode(true)
    const styles = document.$el("style")
    if (!(content instanceof Node)) return
    this.root.appendChild(content)
    this.root.appendChild(styles)

    // async function loadCss() {
    //   const request = await fetch("components/DecryptionPage/styles.css")
    //   styles.textContent = await request.text()
    // }
    // loadCss()
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
    this.#decryptTextarea = document.$el("textarea")
    this.#decryptTextarea.setAttribute("part", "textarea")
    this.#decryptButton = document.$el("button")
    this.#decryptButton.setAttribute("part", "button")
    this.#decryptButton.innerText = "decrypt"
    this.#decryptButton.setAttribute("id", "decrypt-btn")
    this.#dialog = document.$el("dialog")
    this.#dialog.setAttribute("part", "dialog")
    this.#dialog.append(this.#decryptTextarea, this.#decryptButton)
    const section = this.root.$("section")
    if (!(section instanceof HTMLElement)) return
    section.append(this.#dialog)
    this.#dialog.showModal()

    this.#dialog.$on("click", (event) => {
      if (!(event instanceof MouseEvent) || !this.#dialog) return
      closeOnClickOutside(event, this.#dialog)
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
      ul.setAttribute("part", "ul")
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
