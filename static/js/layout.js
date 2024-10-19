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

document.querySelector("button#decrypt")?.addEventListener(
  "click",
  async () => {
    const response = await fetch("/form")
    const html = await response.text()

    modal.innerHTML = html
    backdrop.append(modal)
    document.body.append(backdrop)
  },
)
