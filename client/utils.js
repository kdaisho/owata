/**
 * @param {string} data
 * @param {string} endpoint
 * @returns {Promise<string[]>}
 */
export async function submitText(data, endpoint) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: data,
  })

  return await response.json()
}

/**
 * @param {MouseEvent} event
 * @param {HTMLDialogElement} modal
 */
export function closeOnClickOutside(event, modal) {
  const rect = modal.getBoundingClientRect()
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  ) {
    modal.close()
  }
}

/**
 * @param {string} selector
 * @returns {Element | null}
 */
export const $ = (selector) => document.querySelector(selector)

/**
 * @param {string} selector
 * @returns {NodeListOf<Element> | null}
 */
export const $$ = (selector) => document.querySelectorAll(selector)

/**
 * @param {string} selector
 * @returns {HTMLElement | null}
 */
ShadowRoot.prototype.$ = function (selector) {
  return this.querySelector(selector)
}

/**
 * @param {string} selector
 * @returns {NodeListOf<Element> | null}
 */
ShadowRoot.prototype.$$ = function (selector) {
  return this.querySelectorAll(selector)
}

/**
 * @param {string} selector
 * @returns {HTMLElement | null}
 */
HTMLElement.prototype.$ = function (selector) {
  return this.querySelector(selector)
}

/**
 * @param {string} selector
 * @returns {NodeListOf<Element> | null}
 */
HTMLElement.prototype.$$ = function (selector) {
  return this.querySelectorAll(selector)
}

/**
 * @template T
 * @param {string} event
 * @param {(event: T) => void} callback
 */
globalThis.on = function (event, callback) {
  this.addEventListener(
    event,
    /** @type {(event: Event) => void} */ (callback),
  )
}

/**
 * @template T
 * @param {string} event
 * @param {(event: T) => void} callback
 */
Document.prototype.on = function (event, callback) {
  this.addEventListener(
    event,
    /** @type {(event: Event) => void} */ (callback),
  )
}

/**
 * @template T
 * @param {string} event
 * @param {(event: T) => void} callback
 */
HTMLElement.prototype.on = function (event, callback) {
  this.addEventListener(
    event,
    /** @type {(event: Event) => void} */ (callback),
  )
}
