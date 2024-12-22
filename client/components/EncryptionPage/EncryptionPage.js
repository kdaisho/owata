import { $ } from "../../utils.js"

export default class EncryptionPage extends HTMLElement {
  constructor() {
    super()

    this.root = this.attachShadow({ mode: "open" })

    const template = $("#encryption-page-template")
    if (!(template instanceof HTMLTemplateElement)) return
    const content = template.content.cloneNode(true)
    const styles = document.$el("style")
    this.root.appendChild(content)
    this.root.appendChild(styles)

    async function loadCss() {
      const response = await fetch("components/EncryptionPage/styles.css")
      styles.textContent = await response.text()
    }
    loadCss()
  }

  connectedCallback() {
    this.#setButton()
    this.#setList()
    this.#setSubmit()
    this.#render()
  }

  #setButton() {
    if (this.#encryptButton) return
    this.#encryptButton = document.$el("button")
    this.#encryptButton.innerText = "encrypt"
  }

  #setList() {
    document.$on("addrawtext", () => {
      const aside = this.root.$("#raw-text")
      aside?.childNodes.forEach((node) => {
        if (node.nodeName === "UL") {
          node.remove()
        }
      })
      const ul = document.$el("ul")
      for (const text of app.store.rawText) {
        const li = `
          <li>
            <a href=${text} target="_blank" rel="noopener noreferrer">${text}</a>
          </li>
        `
        ul.insertAdjacentHTML("beforeend", li)
        ul.setAttribute("part", "ul")
      }

      if (
        !(aside instanceof HTMLElement) ||
        !(this.#encryptButton instanceof HTMLButtonElement)
      ) return

      aside.append(this.#encryptButton, ul)
    })
  }

  /**
   * @type {HTMLButtonElement | null}
   */
  #encryptButton = null

  #renderForm() {
    const fieldset = `
      <label for="encryption-input">encryption</label>
      <input name="encryption-value" id="encryption-input" />
      <button type="button" id="add">add</button>
    `
    const div = this.root.$("#input-container")
    if (!div) return
    div.innerHTML = fieldset
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

  #setSubmit() {
    this.#encryptButton?.$on("click", async () => {
      const response = await fetch("/encrypt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(app.store.rawText),
      })
      const textarea = document.$el("textarea")
      if (!(textarea instanceof HTMLTextAreaElement)) return
      textarea.classList.add("output")
      textarea.value = await response.text()

      this.root.$("section")?.append(textarea)
      this.#renderCopyButton()
    })
  }

  /**
   * @param {HTMLInputElement} input
   */
  #add(input) {
    app.store.rawText = [
      input.value,
      ...app.store.rawText,
    ]
    input.value = ""
  }

  #render() {
    if (app.store.rawText) {
      const ul = document.$el("ul")
      for (const text of app.store.rawText) {
        ul.innerHTML = `
          <li><a href=${text} target="_blank" rel="noopener noreferrer">${text}</a></li>
        `
      }
      this.root.$("#raw-text")?.appendChild(ul)
    }

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.#renderForm()
        const input = this.root.$("#encryption-input")
        if (
          !(input instanceof HTMLInputElement)
        ) return

        this.$on(
          "keydown",
          /**
           * @param {KeyboardEvent} e
           */
          (e) => {
            if (e.key === "Enter") {
              this.#add(input)
            }
          },
        )
        this.root.$("#add")?.$on(
          "click",
          () => {
            this.#add(input)
          },
        )
      })
    } else {
      this.#renderForm()
    }
  }
}

customElements.define("encryption-page", EncryptionPage)
