interface HTMLElement {
  $: (selector: string) => HTMLElement | null
  $$: (selector: string) => NodeListOf<Element> | null
}

interface ShadowRoot {
  $: (selector: string) => HTMLElement | null
  $$: (selector: string) => NodeListOf<Element> | null
}
