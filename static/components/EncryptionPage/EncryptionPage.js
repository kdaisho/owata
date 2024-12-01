import $store from "../../js/store.js"

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
    this.render()
    globalThis.addEventListener("_appmenuchange", () => {
      this.render()
    })
  }

  #renderForm() {
    const _form = `
      <form action="/encrypt" method="post">
        <label for="encryption-input">encryption</label>
        <textarea
          name="encryption-value"
          id="encryption-value"
          rows="5"
          cols="50"
        ></textarea>
        <button type="button" id="encrypt">encrypt</button>
      </form>
    `
    const form = this.root.querySelector("form")
    if (!form) return
    form.innerHTML = _form
  }

  async #submit() {
    await fetch("/encrypt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify($store.rawText),
      body: JSON.stringify(["https://google.ca"]),
    })
  }

  render() {
    if ($store.rawText) {
      const ul = document.createElement("ul")
      for (const text of $store.rawText) {
        ul.innerHTML = `
          <li><a href=${text} target="_blank" rel="noopener noreferrer">${text}</a></li>
        `
      }
      this.root.querySelector("#raw-text")?.appendChild(ul)
    }

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.#renderForm()
        this.root.querySelector("#encrypt")?.addEventListener(
          "click",
          () => this.#submit(),
        )
      })
    } else {
      this.#renderForm()
    }
  }
}

customElements.define("encryption-page", EncryptionPage)
