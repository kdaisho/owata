interface Document {
  $on: <T extends Event>(event: string, callback: (event: T) => void) => void
  $el: <T extends keyof HTMLElementTagNameMap>(
    tag: T,
  ) => HTMLElementTagNameMap[T]
}

interface ShadowRoot {
  $: (selector: string) => HTMLElement | null
  $$: (selector: string) => NodeListOf<Element> | null
}

interface Element {
  $: (selector: string) => HTMLElement | null
  $$: (selector: string) => NodeListOf<Element> | null
  $on: <T extends Event>(event: string, callback: (event: T) => void) => void
}
