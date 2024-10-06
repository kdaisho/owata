document.getElementById("encryption-form").addEventListener(
  "submit",
  async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("/encrypt", {
        method: "POST",
        body: new FormData(e.target),
      })
      if (response.ok) {
        document.getElementById("encrypted").value = await response.text()
      } else {
        throw new Error(response.status)
      }
    } catch (err) {
      /* directly ends up here only when the promise is rejected: network or CORS errors */
      console.error(err)
    }
  },
)
