import { $, closeOnClickOutside, submitText, toast } from "../../utils.js"

export default class PlayPage extends HTMLElement {
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
    this.import()
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

    const form = document.$el("form")
    form.append(urlFieldset, nameFieldset, cancelButton, addButton)

    form.$on("keydown", (e) => {
      if (e.key === "Enter") {
        this.add(urlInput)
      }
    })

    addButton.$on(
      "click",
      () => {
        this.add(urlInput)
      },
    )

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

  /**
   * @param {HTMLInputElement} urlInput
   */
  add(urlInput) {
    const v = urlInput.value.trim()
    if (!v) return
    app.store.rawText = [v, ...app.store.rawText]
    urlInput.value = ""
  }

  import() {
    const importBtn = this.root.$("#import")
    const template = $("#dialog-template")
    if (!(template instanceof HTMLTemplateElement)) return

    importBtn?.$on("click", () => {
      this.root.append(template?.content.cloneNode(true))
      const dialog = this.root.$("dialog")
      if (!(dialog instanceof HTMLDialogElement)) return

      dialog.showModal()

      const textarea = this.root.$("#dialog-textarea")
      const decryptBtn = this.root.$("#dialog-btn")
      if (!(textarea instanceof HTMLTextAreaElement) || !decryptBtn) return

      decryptBtn.innerText = "decrypt"

      decryptBtn.$on("click", async () => {
        const value = textarea.value.trim()
        if (!value) return

        /**
         * @type {string[]}
         */
        let data = []
        if (
          !app.store.rawText.length ||
          (app.store.rawText.length && "prompted" in decryptBtn.dataset)
        ) {
          data = await submitText(value, "/decrypt")
          delete decryptBtn.dataset.prompted
        } else if (app.store.rawText.length) {
          decryptBtn.dataset.prompted = ""
          decryptBtn.innerText = "list already exist. wanna overwrite?"
          return
        }

        const links = this.root.$(".links")
        links?.replaceChildren()
        app.store.rawText = data
        toast("success", "successfully decrypted!")
        dialog.close()
      })

      dialog.$on(
        "click",
        /** @type {(event: MouseEvent) => void} */ (event) => {
          closeOnClickOutside(event, dialog)
        },
        { once: true },
      )

      dialog.$on("close", () => {
        this.root.removeChild(dialog)
      })
    })
  }

  populateList() {
    const links = this.root.$(".links")

    document.$on("addrawtext", () => {
      let url = ""
      try {
        url = (new URL(app.store.rawText[0])).toString()
      } catch (_) { /* do nothing */ }

      links?.insertAdjacentHTML(
        "afterbegin",
        /*html*/ `
        <li>
        ${
          url
            ? `<a href=${url} target="_blank" rel="noopener noreferrer">${url}</a>`
            : `<span>${app.store.rawText[0]}</span>`
        }
        </li>
      `,
      )
    })
  }

  setSubmit() {
    const encryptBtn = this.root.$("#encrypt")
    if (!encryptBtn) return

    encryptBtn.$on("click", async () => {
      const rawTexts = app.store.rawText
      if (!rawTexts.length) {
        toast("warn", "create a list first")
        return
      }
      const response = await fetch("/encrypt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rawTexts),
      })

      const template = $("#dialog-template")

      if (!(template instanceof HTMLTemplateElement)) return
      this.root.append(template?.content.cloneNode(true))

      const dialog = this.root.$("dialog")
      const textarea = this.root.$("#dialog-textarea")
      if (
        !(textarea instanceof HTMLTextAreaElement) ||
        !(dialog instanceof HTMLDialogElement)
      ) return
      dialog.id = "copy-encryption-value"

      textarea.innerText = await response.text()

      const copyBtn = dialog.$("button")
      if (!copyBtn) return
      copyBtn.innerText = "copy"
      copyBtn.$on("click", () => {
        navigator.clipboard.writeText(textarea.value).then(() => {
          console.info("copied successfully!")
          const temp = copyBtn.innerText
          copyBtn.innerText = "copied!"
          setTimeout(() => {
            copyBtn.innerText = temp
          }, 750)
        }).catch((err) => console.error("copy failed", err))
      })

      dialog.showModal()

      dialog.$on(
        "click",
        /** @type {(event: MouseEvent) => void} */ (event) => {
          closeOnClickOutside(event, dialog)
        },
        { once: true },
      )

      dialog.$on("close", () => {
        this.root.removeChild(dialog)
      })
    })
  }
}

customElements.define("play-page", PlayPage)
