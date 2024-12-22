export const playPageCss = new CSSStyleSheet()
playPageCss.replaceSync(/*css*/ `
  .top-nav {
    display: flex;
    gap: 2rem;
    justify-content: flex-end;
  }
  
  button.icon {
    filter: drop-shadow(var(--shadow-s) var(--darkblue));
    font-size: var(--h2);
    height: 40px;
    position: relative;
    width: 40px;
    translate: -74px 0;
  }

  button.icon::after {
    content: '\\2039';
    top: 50%;
    left: 50%;
    position: absolute;
    transform: translate(-50%, -54%);
  }

  aside {
    background: var(--darkblue);
    border-radius: var(--border-radius-l);
    filter: drop-shadow(var(--shadow-m) var(--darkblue));
    padding: 0 1.25rem 3rem;
    position: fixed;
    right: -352px;
    top: 66px;
    transition: translate .25s;
  }

  aside.active {
    translate: calc(-352px - 1.5rem);
  }

  .active button.icon::after {
    content: '\\203A';
  }

  aside fieldset {
    display: grid;
    gap: .25rem;
  }

  aside form {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: .75rem;
  }

  form fieldset {
    grid-column: 1 / 3;
  }

  form fieldset:last-of-type {
    margin-bottom: 1.5rem;
  }

  form button:first-child {
    grid-column: 1 / 2;
  }

  form button:last-child {
    grid-column: 2 / 3;
  }
`)
