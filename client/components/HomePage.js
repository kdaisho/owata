import { $ } from "../utils.js"

export default class HomePage extends HTMLElement {
  constructor() {
    super()
    this.root = this.attachShadow({ mode: "open" })

    for (const name of ["reset", "home"]) {
      const link = document.$el("link")
      link.rel = "stylesheet"
      link.href = `css/${name}.css`
      this.root.append(link)
    }

    const template = $("#home-page-template")
    if (!(template instanceof HTMLTemplateElement)) return
    const content = template.content.cloneNode(true)
    this.root.appendChild(content)
  }

  connectedCallback() {
    document.startViewTransition
      ? document.startViewTransition(() => this.render())
      : this.render()
  }

  render() {
    const section = this.root.$("section")
    if (!section) return
    section.innerHTML = /*html*/ `
      <div class="home">
        <hgroup>
          <h2 part="h2">welcome to owata!</h2>
          <p>your private, secure bookmarking tool.</p>
        </hgroup>

        <h4 part="h4">~ how it works ~</h4>

        <div class='category'>
          <h4 part="h4">encrypt:</h4>

          <ol>
            <li>head to the "play" page</li>
            <li>open the input pane by clicking the arrow button</li>
            <li>type in your url, give it a name (optional), and hit "add" to save it to your list</li>
            <li>repeat as needed! when you're done, close the pane and click "encrypt"</li>
          </ol>

          <p>
            owata will turn your list of urls into secure, ciphered text. copy it, and store it safely.
            (owata has no interest in storing it-keeping it safe is your responsibility!)
          </p>
        </div>

        <div class='category'>
          <h4 part="h4">decrypt:</h4>
          <p>
            when you return, hit "import", paste your ciphered text, and owata will decrypt it, showing your original urls on the screen. your stuff stays secure, private, and in your control!
          </p>
        </div>
      </div>
    `
  }
}

customElements.define("home-page", HomePage)
