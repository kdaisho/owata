/**
 * @typedef {object} HyperlinkObject
 * @property {string} url
 * @property {string} name
 * @property {string} id
 */

/**
 * @typedef {Object} Store
 * @property {HyperlinkObject[]} hyperlinks
 */

/** @type {Store} */
const store = {
  hyperlinks: [],
}

export default new Proxy(store, {
  /**
   * @param {keyof Store} prop
   * @param {Store[keyof Store]} value
   */
  set(target, prop, value) {
    Reflect.set(target, prop, value)

    if (prop === "hyperlinks") {
      const prevLength = target[prop].length
      document.dispatchEvent(
        new Event(
          Reflect.get(target, prop).length - prevLength === 1
            ? "link:prepend"
            : "link:iterate",
        ),
      )
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
