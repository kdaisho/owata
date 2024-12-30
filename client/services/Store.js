/**
 * @typedef {object} HyperlinkObject
 * @property {string} url
 * @property {string} name
 * @property {string} index
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
    const prevLength = target[prop].length
    Reflect.set(target, prop, value)

    if (prop === "hyperlinks") {
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
