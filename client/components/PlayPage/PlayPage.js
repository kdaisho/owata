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
      link.rel = "preload"
      link.href = `css/${name}.css`
      link.as = "style"
      link.onload = () => {
        link.rel = "stylesheet"
      }
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
    // this.setupSubmit()
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

    section.style.visibility = "visible"

    const toggle = this.root.$(".icon-btn")
    if (!toggle) return
    toggle.$on("click", () => {
      aside.classList.toggle("active")
    })
  }

  populateList() {
    const links = this.root.$(".links")

    document.$on("addrawtext", () => {
      console.log("==> ADDED", app.store.rawText)
      const a = document.$el("a")
      a.href = a.innerText = app.store.rawText[0]

      const li = document.$el("li")
      li.append(a)
      links?.prepend(li)
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
      console.log("==> RES", await response.text())
      // const links = this.root.$('.links')
      // links?.$('ul')
      // const urlInput = this.root.$('input[name="url"]')
      // if (!(urlInput instanceof HTMLTextAreaElement)) return
      // textarea.classList.add("output")
      // textarea.value = await response.text()

      // this.root.$("section")?.append(textarea)
      // this.renderCopyButton()
    })
  }

  // renderCopyButton() {
  //   const btn = document.$el("button")
  //   btn.textContent = "copy to clipboard"
  //   btn.$on("click", () => {
  //     const textarea = this.root.$("textarea.output")
  //     if (!(textarea instanceof HTMLTextAreaElement)) return
  //     navigator.clipboard.writeText(textarea.value)
  //       .then(() => console.log("Copied successfully!"))
  //       .catch((err) => console.error("Copy failed:", err))
  //   })
  //   this.root.$("section")?.append(btn)
  // }

  /**
   * @param {string[]} data
   */
  renderList(data) {
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

  // setupSubmit() {
  //   if (!(this.decryptButton instanceof HTMLButtonElement)) return

  //   this.decryptButton.$on("click", async () => {
  //     if (!(this.decryptTextarea?.value)) return
  //     this.renderList(
  //       await submitText(this.decryptTextarea.value, "/decrypt"),
  //     )
  //   })
  // }
}

customElements.define("play-page", PlayPage)
