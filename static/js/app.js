import "../components/EncryptionPage/EncryptionPage.js"

const encryptionPage = document.createElement("encryption-page")

const main = document.querySelector("main")
if (!main) throw new Error("main elem not found")
main.innerHTML = ""
main?.appendChild(encryptionPage)
