/**
 * @typedef {Object} Store
 * @property {string} encrypted
 * @property {string} decrypted
 * @property {string} activeMode
 */

/** @type {Store} */
const store = {
  encrypted: "",
  decrypted: "",
  activeMode: "",
}

const $store = new Proxy(store, {
  /**
   * @param {keyof Store} prop
   */
  set(target, prop, value) {
    target[prop] = value
    if (prop === "encrypted") {
      dispatchEvent(new Event("encrypted"))
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
