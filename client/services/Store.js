/**
 * @typedef {Object} Store
 * @property {string[]} rawText
 * @property {string[]} encrypted
 * @property {string[]} decrypted
 */

/** @type {Store} */
const store = {
  rawText: [],
  encrypted: [],
  decrypted: [],
}

const $store = new Proxy(store, {
  /**
   * @param {keyof Store} prop
   */
  set(target, prop, value) {
    target[prop] = value
    if (prop === "rawText") {
      console.log(store.rawText)
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
