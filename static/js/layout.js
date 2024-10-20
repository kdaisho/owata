import $store from "./store.js"

const modal = document.createElement("div")
modal.id = "modal"
modal.className = "modal"

const backdrop = document.createElement("div")
backdrop.className = "backdrop"

backdrop.addEventListener("click", () => {
  backdrop.remove()
})

modal.addEventListener("click", (event) => {
  event.stopPropagation()
})

/**
 * @type {HTMLFormElement | null}
 */
let formElem

document.querySelector("button#decryption")?.addEventListener(
  "click",
  async () => {
    await renderModal({
      action: "/decrypt",
      label: "decrypt!",
    })
    formElem?.addEventListener(
      "submit",
      submit,
    )
  },
)

document.querySelector("button#encryption")?.addEventListener(
  "click",
  async () => {
    await renderModal({
      action: "/encrypt",
      label: "let's encrypt",
      isEncryption: true,
    })

    formElem?.addEventListener(
      "submit",
      submit,
    )
  },
)

/**
 * @param {Object} param
 * @param {string} param.action
 * @param {string} param.label
 * @param {boolean} [param.isEncryption]
 */
async function renderModal({ action, label, isEncryption = false }) {
  const response = await fetch("/get-form", {
    method: "POST",
    body: JSON.stringify({
      action,
      label,
      isEncryption,
    }),
  })
  const html = await response.text()

  modal.innerHTML = html
  backdrop.append(modal)
  document.body.append(backdrop)
  formElem = modal.querySelector("#form")
  formElem?.querySelector("#input")?.addEventListener("keydown", (e) => {
    if (e instanceof KeyboardEvent && e.key === "Enter") {
      e.preventDefault()
      formElem?.requestSubmit()
    }
  })

  formElem?.querySelector("#switch")?.addEventListener("click", async () => {
    await renderModal({
      action: isEncryption ? "/decrypt" : "/encrypt",
      label: isEncryption ? "decrypt!" : "let's encrypt",
      ...(!isEncryption && { isEncryption: true }),
    })
    formElem?.addEventListener(
      "submit",
      submit,
    )
  })
}

/**
 * @param {SubmitEvent} event
 */
async function submit(event) {
  event.preventDefault()
  if (!formElem || !(event.target instanceof HTMLFormElement)) return

  try {
    const response = await fetch(formElem.action, {
      method: "POST",
      body: new FormData(event.target),
    })
    if (response.ok) {
      $store.encrypted = await response.text()
      const textarea = formElem.querySelector("#output")
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.value = $store.encrypted
      }
    } else {
      throw new Error(response.status.toString())
    }
  } catch (err) {
    /* directly ends up here only when the promise is rejected: network or CORS errors */
    console.error(err)
  }
}
