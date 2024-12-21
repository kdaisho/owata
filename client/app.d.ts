interface Element {
  $: (selector: string) => HTMLElement | null
  $$: (selector: string) => NodeListOf<Element> | null
  on: <T extends Event>(event: string, callback: (event: T) => void) => void
}

interface Document {
  on: <T extends Event>(event: string, callback: (event: T) => void) => void
}

interface ShadowRoot {
  $: (selector: string) => HTMLElement | null
  $$: (selector: string) => NodeListOf<Element> | null
}
