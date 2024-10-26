import $store from "./store.js"

const modal = document.createElement("div")
modal.id = "modal"
modal.className = "modal"

const backdrop = document.createElement("div")
backdrop.className = "backdrop"

backdrop.addEventListener("click", () => {
  backdrop.remove()
  $store.activeMode = ""
})

modal.addEventListener("click", (event) => {
  event.stopPropagation()
})

document.addEventListener("keydown", async (event) => {
  if (event.key === "Escape") {
    backdrop.remove()
    $store.activeMode = ""
  }
  if (backdrop.hasChildNodes() && event.key === "ArrowRight" && event.metaKey) {
    await switchMode($store.activeMode === "decryption" ? false : true)
  }
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
      buttonLabel: "decrypt",
    })
    formElem?.addEventListener(
      "submit",
      submit,
    )
    $store.activeMode = "decryption"
  },
)

document.querySelector("button#encryption")?.addEventListener(
  "click",
  async () => {
    await renderModal({
      action: "/encrypt",
      label: "let's encrypt",
      buttonLabel: "encrypt",
      isEncryption: true,
    })
    formElem?.addEventListener(
      "submit",
      submit,
    )
    $store.activeMode = "encryption"
  },
)

/**
 * @param {Object} param
 * @param {string} param.action
 * @param {string} param.label
 * @param {string} param.buttonLabel
 * @param {boolean} [param.isEncryption]
 */
async function renderModal(
  { action, label, buttonLabel, isEncryption = false },
) {
  const response = await fetch("/form", {
    method: "POST",
    body: JSON.stringify({
      action,
      label,
      buttonLabel,
      isEncryption,
    }),
  })

  modal.innerHTML = await response.text()
  backdrop.append(modal)
  document.body.append(backdrop)
  formElem = modal.querySelector("#form")
  /**
   * @type {HTMLTextAreaElement | null | undefined}
   */
  const input = formElem?.querySelector("#input")
  input?.focus()

  input?.addEventListener("keydown", (e) => {
    if (e instanceof KeyboardEvent && e.key === "Enter") {
      e.preventDefault()
      formElem?.requestSubmit()
    }
  })

  formElem?.querySelector("#output")?.addEventListener(
    "dblclick",
    (e) => {
      if (e.target instanceof HTMLTextAreaElement) {
        navigator.clipboard.writeText(e.target.value).then(() => {
          console.info("Copied")
        })
      }
    },
  )

  formElem?.querySelector("#switch")?.addEventListener("click", async () => {
    await switchMode(isEncryption)
  })
}

/**
 * @param {boolean} isEncryption
 */
async function switchMode(isEncryption) {
  await renderModal({
    action: isEncryption ? "/decrypt" : "/encrypt",
    label: isEncryption ? "decrypt!" : "let's encrypt",
    buttonLabel: isEncryption ? "decrypt" : "encrypt",
    ...(!isEncryption && { isEncryption: true }),
  })
  formElem?.addEventListener(
    "submit",
    submit,
  )
  $store.activeMode = isEncryption ? "decryption" : "encryption"
}

/**
 * @param {SubmitEvent} event
 */
async function submit(event) {
  event.preventDefault()

  if (
    !formElem || !(event.target instanceof HTMLFormElement)
  ) return

  const text = /** @type {string} */ ((new FormData(event.target)).get(
    "input-value",
  ))

  if (!text.trim()) return

  try {
    const response = await fetch(formElem.action, {
      method: "POST",
      body: text,
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

    toast("Copied to clipboard!")
    navigator.clipboard.writeText($store.encrypted)
  } catch (err) {
    // ends up here only when the promise is rejected: network or CORS errors
    console.error(err)
  }
}

function toast(text = "") {
  const div = document.createElement("div")
  const p = document.createElement("p")
  p.classList.add("text-small")
  p.textContent = text
  div.appendChild(p)
  div.classList.add("toast")
  document.body.appendChild(div)

  setTimeout(() => {
    const toast = document.body.querySelector("div.toast")
    if (toast) {
      toast.remove()
    }
  }, 3000)
}
