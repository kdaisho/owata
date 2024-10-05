import { me } from "./js/me.js"

console.log("==> SOME", me)

document.getElementById("encryption-form").addEventListener(
  "submit",
  async (e) => {
    e.preventDefault()
    const response = await fetch("/encrypt", {
      method: "POST",
      body: new FormData(e.target),
    })
    document.getElementById("encrypted").value = await response.text()
  },
)

document
  .getElementById("decryption-form").addEventListener("submit", async (e) => {
    e.preventDefault()
    const response = await fetch("/decrypt", {
      method: "POST",
      body: new FormData(e.target),
    })
    document.getElementById("decrypted").value = await response.text()
  })
