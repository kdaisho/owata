export default class EncryptionPage extends HTMLElement {
  constructor() {
    super()

    this.root = this.attachShadow({ mode: "open" })

    const template = document.querySelector("#encryption-page-template")
    if (!(template instanceof HTMLTemplateElement)) return
    const content = template.content.cloneNode(true)
    const styles = document.createElement("style")
    if (!(content instanceof Node)) return
    this.root.appendChild(content)
    this.root.appendChild(styles)

    async function loadCss() {
      const request = await fetch("components/EncryptionPage/styles.css")
      styles.textContent = await request.text()
    }
    loadCss()
  }

  connectedCallback() {
    this.#init()
    this.render()
    this.#renderList()
    this.#setupSubmit()
  }

  #init() {
    if (this.#encryptButton) return
    this.#encryptButton = document.createElement("button")
    this.#encryptButton.setAttribute("id", "encrypt")
    this.#encryptButton.innerText = "encrypt"
  }

  #renderList() {
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
      aside.append(this.#encryptButton)
      aside.append(ul)
    })
  }

  /**
   * @type {HTMLButtonElement | null}
   */
  #encryptButton = null

  #renderForm() {
    const _form = `
      <form action="/encrypt" method="post">
        <label for="encryption-input">encryption</label>
        <textarea
          name="encryption-value"
          id="encryption-textarea"
          rows="5"
          cols="50"
        ></textarea>
        <button type="button" id="add">add</button>
      </form>
    `
    const form = this.root.querySelector("form")
    if (!form) return
    form.innerHTML = _form
  }

  #setupSubmit() {
    console.log("==>", "======================== YO", this.#encryptButton)
    this.#encryptButton?.addEventListener("click", async () => {
      console.log("==>", "======================== ooo")
      const response = await fetch("/encrypt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(app.store.rawText),
      })

      const data = await response.json()

      console.log("==>", { data })

      const textarea = document.createElement("textarea")
      if (!(textarea instanceof HTMLTextAreaElement)) return
      textarea.value = data.join(",")
      const sec = this.root.querySelector("section")
      console.log("==>", sec)
      this.root.querySelector("section")?.append(textarea)
    })
  }

  /**
   * @param {HTMLTextAreaElement} textarea
   */
  #add(textarea) {
    app.store.rawText = [
      textarea.value,
      ...app.store.rawText,
    ]
    textarea.value = ""
  }

  render() {
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
        const textarea = this.root.querySelector("#encryption-textarea")
        if (!(textarea instanceof HTMLTextAreaElement)) return
        this.root.querySelector("#add")?.addEventListener(
          "click",
          () => this.#add(textarea),
        )
      })
    } else {
      this.#renderForm()
    }
  }
}

customElements.define("encryption-page", EncryptionPage)
