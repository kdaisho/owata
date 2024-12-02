/**
 * @typedef {Object} Store
 * @property {string[]} rawText
 * @property {string[]} encrypted
 * @property {string} encryptedOutput
 * @property {string[]} decrypted
 * @property {"encryption" | "decryption" | null} activeMode
 * @property {HTMLTextAreaElement | null | undefined} encryptionInputTextarea
 */

/** @type {Store} */
const store = {
  rawText: ["fdadfsad"],
  encrypted: [],
  encryptedOutput: "",
  decrypted: [],
  activeMode: null,
  encryptionInputTextarea: null,
}

const $store = new Proxy(store, {
  /**
   * @param {keyof Store} prop
   */
  set(target, prop, value) {
    target[prop] = value
    if (prop === "rawText") {
      console.log("==>", "======================== ne")
      document.dispatchEvent(new Event("addrawtext"))
    }
    return true
  },

  /**
   * @param {keyof Store} prop
   */
  get(target, prop) {
    return target[prop]
  },
})

export default $store
