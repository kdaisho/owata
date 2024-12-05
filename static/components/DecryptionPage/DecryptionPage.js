export default class DecryptionPage extends HTMLElement {
  constructor() {
    super()

    this.root = this.attachShadow({ mode: "open" })

    const template = document.querySelector("#decryption-page-template")
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

  /**
   * @type {HTMLTextAreaElement | null }
   */
  #decryptTextarea = null

  /**
   * @type {HTMLButtonElement | null }
   */
  #decryptButton = null

  connectedCallback() {
    this.#decryptTextarea = document.createElement("textarea")
    this.#decryptButton = document.createElement("button")
    this.#decryptButton.innerText = "decrypt"
    const section = this.root.querySelector("section")
    if (!(section instanceof HTMLElement)) return
    section.append(this.#decryptTextarea, this.#decryptButton)
    this.#setupSubmit()
  }

  #setupSubmit() {
    if (
      !(this.#decryptTextarea instanceof HTMLTextAreaElement) ||
      !(this.#decryptButton instanceof HTMLButtonElement)
    ) return

    this.#decryptButton.addEventListener("click", async () => {
      const response = await fetch("/decrypt", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: this.#decryptTextarea?.value,
      })

      const data = await response.json()
      console.log("==> BACK", { data })
    })
  }
}

customElements.define("decryption-page", DecryptionPage)
