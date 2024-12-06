export function bindValues(
  html: string,
  props: { [key: string]: string },
): string {
  return html.replace(/{{(.*)}}/g, (_, key) => {
    return props[key.trim()]
  })
}
