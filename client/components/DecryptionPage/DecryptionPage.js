import { $, closeOnClickOutside, submitText } from "../utils.js"

export default class DecryptionPage extends HTMLElement {
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
  #modal = null

  constructor() {
    super()

    this.root = this.attachShadow({ mode: "open" })

    const template = $("#decryption-page-template")
    if (!(template instanceof HTMLTemplateElement)) return
    const content = template.content.cloneNode(true)
    const styles = document.createElement("style")
    if (!(content instanceof Node)) return
    this.root.appendChild(content)
    this.root.appendChild(styles)

    async function loadCss() {
      const request = await fetch("components/DecryptionPage/styles.css")
      styles.textContent = await request.text()
    }
    loadCss()
  }

  connectedCallback() {
    this.#init()
    this.#setupSubmit()
  }

  #init() {
    this.#decryptTextarea = document.createElement("textarea")
    this.#decryptButton = document.createElement("button")
    this.#decryptButton.innerText = "decrypt"
    this.#modal = document.createElement("dialog")
    this.#modal.append(this.#decryptTextarea, this.#decryptButton)
    const section = this.root.$("section")
    if (!(section instanceof HTMLElement)) return
    section.append(this.#modal)
    this.#modal.showModal()
    this.#modal.addEventListener("click", (event) => {
      if (!(event instanceof MouseEvent) || !this.#modal) return
      closeOnClickOutside(event, this.#modal)
    })
  }

  /**
   * @param {string[]} data
   */
  #renderList(data) {
    const ul = document.createElement("ul")
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

    this.#decryptButton.addEventListener("click", async () => {
      if (!(this.#decryptTextarea?.value)) return
      this.#renderList(
        await submitText(this.#decryptTextarea.value, "/decrypt"),
      )
    })
  }
}

customElements.define("decryption-page", DecryptionPage)
