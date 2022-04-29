const template = document.createElement("template");

// Styling range input thumbs requires you to separately define the CSS rules
// for different browsers. We store them once here for ease of maintenance.
const thumbStyles = `
  background-color: var(--thumb-background-color);
  background-image: var(--thumb-background-image);
  background-size: 90%;
  background-position: center center;
  background-repeat: no-repeat;
  border-radius: var(--thumb-radius);
  border: var(--thumb-border-size) var(--thumb-border-color) solid;
  color: var(--thumb-border-color);
  width: var(--thumb-size);
  height: var(--thumb-size);
`;

const thumbFocusStyles = `
  box-shadow: 0px 0px 0px var(--focus-width) var(--focus-color);
`;

const thumbSvgWidth = 4;

// Since the code below is a template string literal, it will not be minified or
// transpiled
template.innerHTML = /*html*/`
  <style>
    :host {
      --exposure-1: 33%;
      --exposure-2: 66%;
      --thumb-background-color: hsla(0, 0%, 100%, 0.9);
      --thumb-background-image: url('data:image/svg+xml;utf8,<svg viewbox="0 0 60 60"  width="60" height="60" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="${thumbSvgWidth}" d="M20 20 L10 30 L20 40"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="${thumbSvgWidth}" d="M40 20 L50 30 L40 40"/></svg>');
      --thumb-size: clamp(3em, 10vmin, 5em);
      --thumb-radius: 50%;
      --thumb-border-color: hsla(0, 0%, 0%, 0.9);
      --thumb-border-size: 2px;
      --focus-width: var(--thumb-border-size);
      --focus-color: hsl(200, 100%, 80%);
      --divider-width: 2px;
      --divider-color: hsla(0, 0%, 0%, 0.9);
      display: flex;
      flex-direction: column;
      margin: 0;
      overflow: hidden;
      position: relative;
    }
    ::slotted(div) {
      height: auto;
      width: 100%;
      pointer-events:initial;
    }
    ::slotted([slot='viewer-2']) {
      clip-path: polygon(
        calc(var(--exposure-1) + var(--divider-width)/2) 0, 
        100% 0, 
        100% 100%, 
        calc(var(--exposure-1) + var(--divider-width)/2) 100%);
    }
    ::slotted([slot='viewer-3']) {
        clip-path: polygon(
          calc(var(--exposure-2) + var(--divider-width)/2) 0, 
          100% 0, 
          100% 100%, 
          calc(var(--exposure-2) + var(--divider-width)/2) 100%);
      }
    slot {
      display: flex;
      flex-direction: column;
      width: 100%;
      pointer-events:none;
    }
    slot[name='viewer-2'],
    slot[name='viewer-3'] {
      position: absolute;
      top:0;
      filter: drop-shadow(calc(var(--divider-width) * -1) 0 0 var(--divider-color));
    }
    .visually-hidden {
      border: 0; 
      clip: rect(0 0 0 0); 
      clip-path: polygon(0px 0px, 0px 0px, 0px 0px);
      -webkit-clip-path: polygon(0px 0px, 0px 0px, 0px 0px);
      height: 1px; 
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      width: 1px;
      white-space: nowrap;
    }
    label {
      /*align-items: stretch;*/
      /*display: flex;*/
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      pointer-events:none;
    }
    input {
      cursor: col-resize;
      margin: 0 calc(var(--thumb-size) / -2);
      width: calc(100% + var(--thumb-size));
      appearance: none;
      -webkit-appearance: none;
      background: none;
      border: none;
      pointer-events: none;
      position:absolute;
      bottom:0;
    }
    ::-moz-range-thumb {
      ${thumbStyles}
      pointer-events: initial;
    }
    ::-webkit-slider-thumb {
      -webkit-appearance: none;
      pointer-events: initial;
      ${thumbStyles}
    }
    input:focus::-moz-range-thumb {
      ${thumbFocusStyles}
    }
    input:focus::-webkit-slider-thumb {
      ${thumbFocusStyles}
    }
  </style>
  <slot name="viewer-1"></slot>
  <slot name="viewer-2"></slot>
  <slot name="viewer-3"></slot>
  
  <label>
    <input id="input-1" type="range" value="33" min="0" max="100"/>
    <input id="input-2" type="range" value="66" min="0" max="100"/>
  </label>
`;

/**
 * Our ImageCompare web component class
 * 
 * @attr {string} label-text - Provide additional context to screen reader users.
 * 
 * @slot viewer-1 - Your first viewer. Will appear on the "left"
 * @slot viewer-2 - Your second viewer. Will appear on the "right"
 * 
 * @cssprop --thumb-background-color - The background color of the range slider handle. 
 * @cssprop --thumb-background-image - The background image of the range slider handle.
 * @cssprop --thumb-size - The size of the range slider handle.
 * @cssprop --thumb-radius - The border-radius of the range slider handle.
 * @cssprop --thumb-border-color - The color of the range slider handle border.
 * @cssprop --thumb-border-size - The width of the range slider handle border.
 * 
 * @ccprop --focus-width - The width of the range slider handle's focus outline.
 * @ccprop --focus-color - The color of the range slider handle's focus outline.
 *
 * @ccprop --divider-width - The width of the divider shown between the two images.
 * @ccprop --divider-color - The color of the divider shown between the two images.
 */
class ViewerCompare extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    ['input', 'change'].forEach((eventName) => {
      this.shadowRoot.querySelector("input#input-1").addEventListener(
        eventName,
        ({ target }) => {
          if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

          // TODO this should shift exposure-2 away as well to ensure exposure-1 < exposure-2

          this.animationFrame = requestAnimationFrame(() => {
            this.shadowRoot.host.style.setProperty('--exposure-1', `${target.value}%`)
          });
        },
      );
      this.shadowRoot.querySelector("input#input-2").addEventListener(
        eventName,
        ({ target }) => {
          if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

          // TODO this should shift exposure-1 away as well to ensure exposure-2 > exposure-1

          this.animationFrame = requestAnimationFrame(() => {
            this.shadowRoot.host.style.setProperty('--exposure-2', `${target.value}%`)
          });
        },
      );
    });

    const customLabel = this.shadowRoot.host.getAttribute('label-text');
    if(customLabel) {
      this.shadowRoot.querySelector(".js-label-text").textContent = customLabel;
    }
  }
}

customElements.define("viewer-compare", ViewerCompare);