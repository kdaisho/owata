import { $ } from "../../utils.js"

export default class HomePage extends HTMLElement {
  constructor() {
    super()

    this.root = this.attachShadow({ mode: "open" })

    const template = $("#home-page-template")
    if (!(template instanceof HTMLTemplateElement)) return
    const content = template.content.cloneNode(true)
    const styles = document.createElement("style")
    if (!(content instanceof Node)) return
    this.root.appendChild(content)
    this.root.appendChild(styles)

    async function loadCss() {
      const request = await fetch("components/HomePage/styles.css")
      styles.textContent = await request.text()
    }
    loadCss()
  }

  connectedCallback() {
    this.render()
  }

  #renderHome() {
    const _home = `
      <div class="home">
        <hgroup>
          <h2>welcome to owata!</h2>
          <p>your private, encrypted bookmarking tool.</p>
        </hgroup>

        <p>
          how it works:
        </p>

        <ul>
          <li>
            enter a website URL into the input field.
          </li>
          <li>
            hit "add" to include it in your bookmark list.
          </li>
          <li>
            repeat steps 1 and 2 for all the URLs you want to save.
          </li>
          <li>
            when you're done, hit "encrypt"
          </li>
        </ul>

        <p>
          owata will encrypt your list of URLs and provide you with a ciphered
          text. copy the ciphered text and store it securely. (owata doesn't
          save anything for you!)
        </p>
        <p>
          when you return, paste the ciphered text to decrypt it and view your
          secret bookmark list. owata keeps your bookmarks secure, private,
          and in your control!
        </p>
      </div>
    `
    const section = this.root.$("section")
    if (!section) return
    section.innerHTML = _home
  }

  render() {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.#renderHome()
      })
    } else {
      this.#renderHome()
    }
  }
}

customElements.define("home-page", HomePage)
