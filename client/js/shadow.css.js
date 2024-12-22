export const resetCss = new CSSStyleSheet()
async function fetchReset() {
  const cssText = await fetch("../css/reset.css")
  return await cssText.text()
}
resetCss.replaceSync(await fetchReset())

export const shadowCss = new CSSStyleSheet()
shadowCss.replaceSync(/*css*/ `
  dialog[open] {
    background:var(--darkblue2);
    border: none;
    border-radius: var(--border-radius-l);
    display: flex; 
    filter: drop-shadow(3px 9px 24px var(--darkblue2));
    flex-flow: column nowrap;
    gap: 1rem;
    max-width: 768px;
    padding: 1.6rem;
    width: 100%;
  }

  dialog::backdrop {
    backdrop-filter: blur(4px);
  }

  textarea {
    background: var(--darkblue2);
    border: 1px solid var(--lightblue);
    border-radius: var(--border-radius-m);
    color: var(--white);
    min-height: 300px;
    padding: 0.5rem;
  }

  button {
    background: var(--lightblue);
    border: 1px solid var(--lightblue);
    border-radius: var(--border-radius-m);
    color: var(--darkblue2);
    cursor: pointer;
    font-size: var(--h5);
    min-height: 2.5rem;
  }

  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible {
    outline: 1px solid var(--lightblue);
    outline-offset: 2px;
  }

  @media (max-width: 767px) {
    dialog {
      margin: auto 0 0 0;
      max-width: calc(100% - 50px);
    }

    textarea {
      height: 60vh;
    }
  }
`)
