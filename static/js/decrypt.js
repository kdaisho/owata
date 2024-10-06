document.getElementById("decryption-form").addEventListener(
  "submit",
  async (e) => {
    e.preventDefault()
    const response = await fetch("/decrypt", {
      method: "POST",
      body: new FormData(e.target),
    })
    document.getElementById("decrypted").value = await response.text()
  },
)
