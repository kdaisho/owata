import type HomePage from "./components/HomePage.js"
import type CryptoPage from "./components/CryptoPage.js"

declare global {
  interface Document {
    $on: <T extends Event>(event: string, callback: (event: T) => void) => void
    $el: <
      T extends keyof HTMLElementTagNameMap | keyof CustomElementTagNameMap,
    >(
      tag: T,
    ) => T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T]
      : T extends keyof CustomElementTagNameMap ? CustomElementTagNameMap[T]
      : Element
  }

  interface Element {
    $: (selector: string) => HTMLElement | null
    $$: (selector: string) => NodeListOf<Element> | null
    $on: <T extends keyof HTMLElementEventMap>(
      event: T,
      callback: (event: HTMLElementEventMap[T]) => void,
      options?: AddEventListenerOptions,
    ) => void
    $attr: (attribute: string, value: string) => void
  }

  interface ShadowRoot {
    $: (selector: string) => HTMLElement | null
    $$: (selector: string) => NodeListOf<Element> | null
  }

  interface CustomElementTagNameMap {
    "home-page": HomePage
    "crypto-page": CryptoPage
  }
}
