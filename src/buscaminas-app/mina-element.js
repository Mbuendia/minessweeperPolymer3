import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

class minaElement extends PolymerElement {
    static get template() {
      return html`
      <style>
      :host {
        display: block; 
      }
      .mina{
        padding: .5rem;
      }
    </style>
      <template>
        <div class="mina" onClick="[[_comprobarBomb]]">[[mine]]</div>
      </template>`;
    
    }
    static get properties() {
      return {
        mine: {
          type: String
        }
      };
    }
  
    ready() {
      super.ready();
      console.log(this.mine);
    }
  }
  window.customElements.define('mina-element', minaElement);