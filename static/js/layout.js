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

/**
 * @type {HTMLDivElement | null}
 */
let entry

/**
 * @type {HTMLButtonElement | null}
 */
let addButton

/**
 * @type {HTMLUListElement | null}
 */
let rawTextList

/**
 * @param {string} str
 * @returns {boolean}
 */
function isValidUrl(str) {
  console.log("==>", { str })
  try {
    new URL(str)
    return true
  } catch (_) {
    console.log("==>", _)
    return false
  }
}

document.addEventListener("addrawtext", () => {
  if (!rawTextList) return
  rawTextList.innerHTML = ""

  const input = document.createElement("input")
  input.hidden = true
  input.value = $store.rawText.join("|")
  input.name = "raw-text-value"
  formElem?.append(input)

  for (const text of $store.rawText) {
    if (!isValidUrl(text)) continue

    const li = document.createElement("li")
    const anchor = document.createElement("a")
    anchor.href = text
    anchor.textContent = text
    anchor.target = "_blank"
    anchor.rel = "noopener noreferrer"
    li.append(anchor, input)
    rawTextList?.appendChild(li)
  }
})

document.querySelector("button#decryption")?.addEventListener(
  "click",
  async () => {
    await renderModal({
      action: "/decrypt",
      label: "decrypt!",
      buttonLabel: "decrypt",
    })
    entry?.addEventListener(
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
    entry?.addEventListener(
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
  entry = modal.querySelector("#entry")
  addButton = document.querySelector("#add")
  rawTextList = document.querySelector("#raw-text")

  console.log("==>", "======================== ", { rawTextList })
  console.log("==>", "======================== ", { addButton })

  addButton?.addEventListener(
    "click",
    () => {
      console.log("==>", "======================== ")
      if (!$store.encryptionInputTextarea?.value) return
      pushRawText($store.encryptionInputTextarea?.value)
      $store.activeMode = "encryption"
    },
  )

  /**
   * @type {HTMLTextAreaElement | null | undefined}
   */
  $store.encryptionInputTextarea = entry?.querySelector("#input")
  $store.encryptionInputTextarea?.focus()

  console.log("==>", $store.encryptionInputTextarea)

  $store.encryptionInputTextarea?.addEventListener("keydown", (e) => {
    if (
      e instanceof KeyboardEvent && e.key === "Enter" &&
      typeof $store.encryptionInputTextarea?.value === "string"
    ) {
      e.preventDefault()
      pushRawText($store.encryptionInputTextarea?.value)

      // entry?.requestSubmit()
    }
  })

  entry?.querySelector("#submit")?.addEventListener(
    "dblclick",
    (e) => {
      if (e.target instanceof HTMLTextAreaElement) {
        navigator.clipboard.writeText(e.target.value).then(() => {
          console.info("copied")
        })
      }
    },
  )

  formElem?.addEventListener("submit", async () => {
    console.log("==>", "======================== NOPE")
    // e.preventDefault()
    if (!formElem) return
    const response = await fetch(formElem?.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify($store.rawText),
    })

    console.log("==>", { response })
  })

  entry?.querySelector("#switch")?.addEventListener("click", async () => {
    await switchMode(isEncryption)
  })

  document.querySelector("#submit")?.addEventListener("click", async () => {
    if (!formElem) return
    const response = await fetch(formElem?.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify($store.rawText),
    })

    const data = await response.text()

    console.log("==>", { data })
  })

  // document.querySelector("#submit")?.addEventListener("submit", () => {
  //   console.log("==>", "======================== b")
  //   // await renderOutputModal()
  // })
}

/**
 * @param {string} text
 */
function pushRawText(text) {
  $store.rawText = [
    text,
    ...$store.rawText,
  ]
  if (!$store.encryptionInputTextarea) return
  $store.encryptionInputTextarea.value = ""
}

async function renderOutputModal() {
  const response = await fetch("/output", {
    method: "GET",
  })

  modal.innerHTML = await response.text()
  backdrop.append(modal)
  document.body.append(backdrop)

  const outputTextarea = document.querySelector("#submit-textarea")
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
  entry?.addEventListener(
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
  console.log("==>", 100)

  if (
    !formElem || !(event.target instanceof HTMLFormElement)
  ) return

  console.log("==>", 101)

  const text = /** @type {string} */ ((new FormData(event.target)).get(
    "input-value",
  ))

  // if (!text.trim()) return

  try {
    const response = await fetch(formElem?.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify($store.rawText),
    })

    if (response.ok) {
      const text = await response.text()
      $store.activeMode === "encryption"
        ? $store.encrypted.push(text)
        : $store.decrypted.push(text)
      const textarea = formElem.querySelector("#submit")
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.value = text
      }
    } else {
      throw new Error(response.status.toString())
    }

    // if (!$store.encryptionInputTextarea) return
    // $store.encryptionInputTextarea.value = ""
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
