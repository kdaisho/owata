import { $, closeOnClickOutside, submit, toast } from "../utils.js"
import("../services/Store.js")

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

    const addButton = document.$el("button")
    addButton.$attr("type", "button")
    addButton.innerText = "add"

    const encryptAllButton = document.$el("button")
    encryptAllButton.$attr("type", "button")
    encryptAllButton.innerText = "encrypt all"

    const form = document.$el("form")
    form.append(urlFieldset, nameFieldset, addButton, encryptAllButton)

    const aside = this.root.$("aside")
    if (!aside) return

    aside.append(form)

    form.$on("keydown", (e) => {
      if (e.key === "Enter") {
        this.add(urlInput, nameInput)
        urlInput.focus()
      }
      if (e.key === "Escape") {
        aside.classList.remove("active")
        removeBackdrop()
      }
    })

    addButton.$on(
      "click",
      () => {
        this.add(urlInput, nameInput)
        urlInput.focus()
      },
    )

    encryptAllButton.$on(
      "click",
      () => {
        this.handleEncrypt()
      },
    )

    const section = this.root.$("section")
    if (!(section instanceof HTMLElement)) return

    section.hidden = false
    const toggle = this.root.$(".toggle-form")
    if (!toggle) return

    const backdrop = document.$el("div")

    toggle.$on("click", () => {
      aside.classList.toggle("active")
      backdrop.classList.add("backdrop")
      aside.classList.contains("active")
        ? section.append(backdrop)
        : removeBackdrop()
      urlInput.focus()
    })

    backdrop.$on("click", () => {
      aside.classList.toggle("active")
      removeBackdrop()
    })

    function removeBackdrop() {
      setTimeout(() => {
        backdrop.remove()
      }, 150)
    }
  }

  /**
   * @param {HTMLInputElement} urlInput
   * @param {HTMLInputElement} nameInput
   */
  add(urlInput, nameInput) {
    const url = urlInput.value.trim()
    const name = nameInput.value.trim()
    if (!url) return
    app.store.hyperlinks = [
      { url, name, id: crypto.randomUUID() },
      ...app.store.hyperlinks,
    ]
    urlInput.value = ""
    nameInput.value = ""
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

      textarea.$on("keydown", async (event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          await handleDecrypt()
        }
      })

      decryptBtn.$on("click", async () => {
        await handleDecrypt()
      })

      const handleDecrypt = async () => {
        const value = textarea.value.trim()
        if (!value) return

        /**
         * @type {string[]}
         */
        let data = []
        if (
          !app.store.hyperlinks.length ||
          (app.store.hyperlinks.length && "prompted" in decryptBtn.dataset)
        ) {
          try {
            data = await submit(value, "/decrypt")
            delete decryptBtn.dataset.prompted
          } catch (_) {
            const temp = decryptBtn.innerText
            decryptBtn.innerText = "hmm... not decrypted text"
            setTimeout(() => {
              decryptBtn.innerText = temp
            }, 3000)
            return
          }
        } else if (app.store.hyperlinks.length) {
          decryptBtn.dataset.prompted = ""
          decryptBtn.innerText = "overwrite the list?"
          return
        }

        const links = this.root.$(".links")
        links?.replaceChildren()
        app.store.hyperlinks = data.map((d) => JSON.parse(d))
        toast("success", "successfully decrypted!")
        dialog.close()
      }

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

    document.$on("link:prepend", () => {
      console.log("==>", app.store.hyperlinks)
      let url = ""
      try {
        url = (new URL(app.store.hyperlinks[0].url)).toString()
      } catch (_) { /* do nothing */ }
      if (!links) return

      links?.insertAdjacentHTML(
        "afterbegin",
        /*html*/ `
        <li>
          ${/*html*/ `<button id="${
          app.store.hyperlinks[0].id
        }" class="square delete-btn"
        title="delete">&#x2715;</button>`}
          ${
          url
            ? /*html*/ `
              <a href=${url} target="_blank" rel="noopener noreferrer">${url}</a><span>${
              app.store.hyperlinks[0].name
            }</span>
            `
            : /*html*/ `
              <span>${app.store.hyperlinks[0].url}</span><span>${
              app.store.hyperlinks[0].name
            }</span>
            `
        }  
        </li>
      `,
      )

      this.handleDeletion()
    })

    document.$on("link:iterate", () => {
      if (!links) return
      links.innerHTML = ""
      console.log("==>", app.store.hyperlinks)

      app.store.hyperlinks.forEach((link) => {
        let url = ""
        try {
          url = (new URL(link.url)).toString()
        } catch (_) { /* do nothing */ }

        links.innerHTML += /*html*/ `
        <li>
        ${/*html*/ `<button class="square delete-btn" id="${link.id}" title="delete">&#x2715;</button>`}
        ${
          url
            ? /*html*/ `
              <a href=${url} target="_blank" rel="noopener noreferrer">${url}</a><span>${link.name}</span>
            `
            : /*html*/ `
              <span>${link.url}</span><span>${link.name}</span>
            `
        }
        </li>
      `
      })

      this.handleDeletion()
    })
  }

  handleDeletion() {
    this.root.$$(".delete-btn")?.forEach((btn) => {
      if (!(btn instanceof HTMLElement)) return
      btn.$on("click", ({ target }) => {
        if (!(target instanceof HTMLElement)) return
        if (target.innerText === "k?") {
          app.store.hyperlinks = app.store.hyperlinks.filter((link) => {
            return link.id !== target.id
          })
        } else {
          setTimeout(() => {
            target.innerText = "k?"
          })
        }
      })
    })
  }

  async handleEncrypt() {
    const hyperlinks = app.store.hyperlinks
    if (!hyperlinks.length) {
      toast("warn", "create a list first")
      return
    }
    const response = await fetch("/encrypt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hyperlinks),
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
  }

  setSubmit() {
    const encryptBtn = this.root.$("#encrypt")
    if (!encryptBtn) return

    encryptBtn.$on("click", () => {
      this.handleEncrypt()
    })
  }
}

customElements.define("play-page", PlayPage)
