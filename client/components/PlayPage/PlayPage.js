import { $, closeOnClickOutside, submitText } from "../../utils.js"

export default class PlayPage extends HTMLElement {
  /**
   * @type {HTMLTextAreaElement | null }
   */
  decryptTextarea = null

  /**
   * @type {HTMLButtonElement | null }
   */
  decryptButton = null

  /**
   * @type {HTMLDialogElement | null }
   */
  #dialog = null

  /**
   * @type {HTMLButtonElement | null}
   */
  importButton = null

  /**
   * @type {HTMLButtonElement | null}
   */
  encryptButton = null

  /**
   * @type {HTMLElement | null}
   */
  // aside = null

  /**
   * @type {HTMLButtonElement | null}
   */
  // sidebarButton = null

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

    const form = document.$el("form")
    form.append(urlFieldset, nameFieldset, cancelButton, addButton)

    const aside = this.root.$("aside")
    if (!aside) return

    aside.append(form)

    const section = this.root.$("section")
    if (!(section instanceof HTMLElement)) return

    section.hidden = false

    const toggle = this.root.$(".icon-btn")
    if (!toggle) return
    toggle.$on("click", () => {
      aside.classList.toggle("active")
    })
  }

  populateList() {
    const links = this.root.$(".links")

    document.$on("addrawtext", () => {
      const url = app.store.rawText[0]
      links?.insertAdjacentHTML(
        "afterbegin",
        /*html*/ `
        <li>
          <a href=${url} target="_blank" rel="noopener noreferrer">
            ${url}
          </a>
        </li>
      `,
      )
    })
  }

  setSubmit() {
    const encryptBtn = this.root.$("button#encrypt")
    if (!encryptBtn) return

    encryptBtn.$on("click", async () => {
      console.log("==>", app.store.rawText)
      const response = await fetch("/encrypt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(app.store.rawText),
      })

      const template = $("#dialog-template")

      if (!(template instanceof HTMLTemplateElement)) return
      this.root.append(template?.content.cloneNode(true))

      const dialog = this.root.$("dialog")
      const textarea = this.root.$("#encrypted")
      if (
        !(textarea instanceof HTMLTextAreaElement) ||
        !(dialog instanceof HTMLDialogElement)
      ) return

      textarea.innerText = await response.text()

      const copyBtn = dialog.$("button")
      copyBtn?.$on("click", () => {
        navigator.clipboard.writeText(textarea.value).then(() => {
          console.info("copied successfully!")
          const temp = copyBtn.innerText
          copyBtn.innerText = "copied!"
          setTimeout(() => {
            copyBtn.innerText = temp
          }, 750)
        }).catch((err) => console.error("copy failed", err))
      })

      document.$on(
        "click",
        /** @type {(event: MouseEvent) => void} */ (event) =>
          closeOnClickOutside(event, dialog),
      )

      dialog.showModal()
    })
  }
}

customElements.define("play-page", PlayPage)
