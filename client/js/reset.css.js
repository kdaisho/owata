export const resetCss = new CSSStyleSheet()

async function fetchReset() {
  const cssText = await fetch("../css/reset.css")
  return await cssText.text()
}

resetCss.replaceSync(await fetchReset())
