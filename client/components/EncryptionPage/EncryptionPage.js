export default class EncryptionPage extends HTMLElement {
  constructor() {
    super()

    this.root = this.attachShadow({ mode: "open" })

    const template = document.querySelector("#encryption-page-template")
    if (!(template instanceof HTMLTemplateElement)) return
    const content = template.content.cloneNode(true)
    const styles = document.createElement("style")
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
    this.#encryptButton = document.createElement("button")
    this.#encryptButton.innerText = "encrypt"
  }

  #setList() {
    document.addEventListener("addrawtext", () => {
      const aside = this.root.querySelector("#raw-text")
      aside?.childNodes.forEach((node) => {
        if (node.nodeName === "UL") {
          node.remove()
        }
      })
      const ul = document.createElement("ul")
      for (const text of app.store.rawText) {
        const _li = `
          <li>
            <a href=${text} target="_blank" rel="noopener noreferrer">${text}</a>
          </li>
        `
        ul.insertAdjacentHTML("beforeend", _li)
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
    const _form = `
      <label for="encryption-input">encryption</label>
      <input name="encryption-value" id="encryption-input" />
      <button type="button" id="add">add</button>
    `
    const div = this.root.querySelector("#input-container")
    if (!div) return
    div.innerHTML = _form
  }

  #setSubmit() {
    this.#encryptButton?.addEventListener("click", async () => {
      const response = await fetch("/encrypt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(app.store.rawText),
      })
      const data = await response.json()
      const textarea = document.createElement("textarea")
      if (!(textarea instanceof HTMLTextAreaElement)) return
      textarea.classList.add("output")
      textarea.value = data.join(",")

      this.root.querySelector("section")?.append(textarea)
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
      const ul = document.createElement("ul")
      for (const text of app.store.rawText) {
        ul.innerHTML = `
          <li><a href=${text} target="_blank" rel="noopener noreferrer">${text}</a></li>
        `
      }
      this.root.querySelector("#raw-text")?.appendChild(ul)
    }

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.#renderForm()
        const input = this.root.querySelector("#encryption-input")
        if (
          !(input instanceof HTMLInputElement)
        ) return

        this.addEventListener(
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
        this.root.querySelector("#add")?.addEventListener(
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
