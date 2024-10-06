const d = document.getElementById("encryption-form")

console.log("==>", { d })

document.getElementById("encryption-form").addEventListener(
  "submit",
  async (e) => {
    console.log("==>", "submitting")
    e.preventDefault()
    const response = await fetch("/encrypt", {
      method: "POST",
      body: new FormData(e.target),
    })
    document.getElementById("encrypted").value = await response.text()
  },
)
