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
 * @param {HTMLDialogElement} dialog
 */
export function closeOnClickOutside(event, dialog) {
  const rect = dialog.getBoundingClientRect()
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  ) {
    dialog.close()
  }
}

/**
 * @param {'success' | 'error' | 'warn'} type
 * @param {string} text
 */
export function toast(type = "success", text = "") {
  const div = document.$el("div")
  const p = document.$el("p")
  p.classList.add("text-small")
  p.textContent = text
  div.classList.add(type)
  div.appendChild(p)
  div.classList.add("toast")
  document.body.appendChild(div)

  setTimeout(() => {
    const toast = document.body.$("div.toast")
    toast?.remove()
  }, 3000)
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
globalThis.$on = function (event, callback) {
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
Document.prototype.$on = function (event, callback) {
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
Element.prototype.$on = function (event, callback) {
  this.addEventListener(
    event,
    /** @type {(event: Event) => void} */ (callback),
  )
}

/**
 * @param {string} attribute
 * @param {string} value
 */
HTMLElement.prototype.$attr = function (attribute, value) {
  this.setAttribute(attribute, value)
}

/**
 * @template {keyof HTMLElementTagNameMap | keyof CustomElementTagNameMap} T
 * @param {keyof HTMLElementTagNameMap | keyof CustomElementTagNameMap} tag
 */
Document.prototype.$el = function (tag) {
  // using any here because jsDoc doesn't support conditional types
  return /** @type {any} */ (document.createElement(tag))
}
