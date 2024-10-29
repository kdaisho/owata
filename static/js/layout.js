import $store from "./store.js"

const modal = document.createElement("div")
modal.id = "modal"
modal.className = "modal"

const backdrop = document.createElement("div")
backdrop.className = "backdrop"

backdrop.addEventListener("click", () => {
  backdrop.remove()
  $store.activeMode = null
})

modal.addEventListener("click", (event) => {
  event.stopPropagation()
})

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    backdrop.remove()
    $store.activeMode = null
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
  $store.encryptionInputTextarea = formElem?.querySelector("#input")
  $store.encryptionInputTextarea?.focus()

  $store.encryptionInputTextarea?.addEventListener("keydown", (e) => {
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
          console.info("copied")
        })
      }
    },
  )

  formElem?.querySelector("#switch")?.addEventListener("click", async () => {
    await switchMode(isEncryption)
  })

  document.querySelector("#output")?.addEventListener("click", async () => {
    await renderOutputModal()
  })
}

async function renderOutputModal() {
  const response = await fetch("/output", {
    method: "GET",
  })

  modal.innerHTML = await response.text()
  backdrop.append(modal)
  document.body.append(backdrop)

  const outputTextarea = document.querySelector("#output-textarea")
  if (outputTextarea instanceof HTMLTextAreaElement) {
    outputTextarea.value = $store.activeMode === "encryption"
      ? $store.encrypted.join(" ")
      : $store.decrypted.join(" ")

    const btn = document.querySelector("#copy-output")
    if (!btn) return

    btn.addEventListener("click", () => {
      navigator.clipboard.writeText(outputTextarea.value).then(() =>
        toast("copied!")
      )
    })
  }
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
      const text = await response.text()
      $store.activeMode === "encryption"
        ? $store.encrypted.push(text)
        : $store.decrypted.push(text)
      const textarea = formElem.querySelector("#output")
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.value = text
      }
    } else {
      throw new Error(response.status.toString())
    }

    if (!$store.encryptionInputTextarea) return
    $store.encryptionInputTextarea.value = ""
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
