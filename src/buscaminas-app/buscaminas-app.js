import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { } from '@polymer/polymer/lib/elements/dom-repeat.js';
/**
 * @customElement
 * @polymer
 */
class Position {
  constructor(column, row) {
    this.column = column;
    this.row = row;
  }

  _validPositionInMatrix(matriz) {
    return this.row >= 0 && this.row < matriz.length && this.column >= 0 && this.column < matriz[this.row].length;
  }
}

class Cell {
  constructor(value, show = false) {
    this.value = value;
    this.show = show;
  }
}

class BuscaminasApp extends PolymerElement {
  static get template() {
    return html`
      <style>
      :host {
        display: inline-block;
      }

      .mina{
        border: 1px solid #797D7F;
        box-shadow: 1px 1px 0 0 #000000;
        padding: .5rem;
        cursor: pointer;
      }

      .container{
        display: inline-block;
        background-color: #D7DBDD;
      }

      .mina:hover {background-color: #34495E}

      .mina:active {
        background-color: #3e8e41;
        box-shadow: 0 5px #AAB7B8;
        transform: translateY(4px);
      }

      .show{
        background-color: black;
        color: antiquewhite;
      }
      .zero {
        background-color: transaparent;
        color: transparent;
        border: 1px solid transparent;
        box-shadow: 1px 1px 0 0 inset;
      }
      .row{
        display: table-cell;
      }

             .warm1 {
        color: green;
      }
             .warm2 {
        color: blue;
      }
      .warm3 {
          color: pink;
      }
             .warm4 {
        color: red;
      }
             .warm5 {
        color: skyblue;
      }
             .warm6 {
        color: orange;
      }
             .warm7 {
        color: brown;
      }
             .warm8 {
        color: purple;
      }
      </style>

      <div class="container">
         <dom-repeat items='[[matriz]]' as='row'>
          <template>
            <div class="row" id="{{index}}" inner-h-t-m-l="[[_setrow(row)]]"></div>
          </template>
        </dom-repeat>
      </div>
    `;
  }
  static get properties() {
    return {
      matriz: {
        type: Array,
        value: () => []
      }
    };
  }

  ready() {
    super.ready();
    this.addEventListener('click', this._clickMine);
    Notification.requestPermission(function (result) {
      if (result === 'denied') {
        console.log('Permission wasn\'t granted. Allow a retry.');
        return;
      } else if (result === 'default') {
        console.log('The permission request was dismissed.');
        return;
      }
      // Hacer algo con el permiso concedido.
    });
    this.init();
  }

  _getRow(bombrow) {
    return bombrow.baseNode.parentNode.id;
  }

  _getColum(bombcolumn) {
    return bombcolumn.baseNode.parentElement.parentElement.id;
  }
  _checkNonMines(mine, domCell) {
    let column = parseInt(mine.mineColumn);
    let row = parseInt(mine.mineRow);
    if (!this.matriz[column][row].show) {
      if (mine.mineValue !== '0') {
        this.matriz[column][row].show = true;
        domCell.baseNode.parentElement.className = 'mina show'
        console.log(this.matriz[column][row]);
      } else {
        console.log('es un 0');
          let columnminor = (column >= 0) ? (column!==0 ) ? column - 1: column : column;
          let rowminor = (row >= 0) ? (row!==0 ) ? row - 1: row : row;
          let columnmayor = (column < this.matriz.length - 1) ? (column !== this.matriz.length) ? column+1 : column : column;
          let rowmayor = (row < this.matriz[column].length - 1) ? (row !== this.matriz[column].length)? row+1: row : row;
          for (let columnsearch = columnminor; columnsearch <= columnmayor; columnsearch++) {
              for (let rowsearch = rowminor; rowsearch <= rowmayor; rowsearch++) {
                if (this.matriz[columnsearch][rowsearch].value === 0) {
                    console.log('encontré 0!');
                    console.log(this.matriz[columnsearch][rowsearch]);
                    this.shadowRoot.children.item(1).children.item(columnsearch).children.item(rowsearch).className = 'mina zero';
                  }
              }
          }
      }
    }
  }

  _checkBomb(bomb) {
    let value = bomb.baseNode.data;
    let row = this._getRow(bomb);
    let column = this._getColum(bomb);
    let mine = { mineValue: value, mineRow: row, mineColumn: column, show: false };
    if (mine.mineValue === 'b') {
      new Notification('bomba!', {});
      this.init();
    } else {
      this._checkNonMines(mine, bomb);
    }
  }

  _clickMine(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    let selection = ev.currentTarget.root.getSelection();
    if (selection.type !== 'Range') {
      this._checkBomb(selection);
    }
  }

  _setrow(row) {
    let rowFormatted = [];
    rowFormatted = row.map((ele, a) => {
      let classMine = (ele.show) ? 'show' : 'hide';
      let warmclass = (ele.value>0) ? `warm${ele.value}`: '';
      return `<div class="mina ${classMine} ${warmclass}" id="${a}">${ele.value}</div>`
    });
    rowFormatted = rowFormatted.join('');
    return rowFormatted;
  }

  init() {
    let multiplo = 12;
    let minas = 10;
    let matriz = [];
    for (let index = 0; index < multiplo; ++index) {
      let row = [];
      for (let indexB = 0; indexB < multiplo; indexB++) {
        row.push(new Cell(0));
      }
      matriz.push(row);
    }

    let numeroBombas = minas;
    while (numeroBombas > 0) {
      this.bombGenerator(matriz, multiplo);
      numeroBombas--;
    }
    this.set('matriz', matriz);
  }

  bombGenerator(matriz, multiplo) {
    let position = this.placeBomb(multiplo);
    matriz[position.column][position.row] = new Cell('b');
    for (let column = -1; column <= 1; column++) {
      for (let row = -1; row <= 1; row++) {
        let auxPosition = new Position(position.column + column, position.row + row);

        if (auxPosition._validPositionInMatrix(matriz)) {
          matriz[auxPosition.column][auxPosition.row].value !== 'b' ? matriz[auxPosition.column][auxPosition.row].value += 1 : matriz[auxPosition.column][auxPosition.row].value;
        }
      }

    }
  }
  placeBomb(multiplo) {
    return new Position(Math.floor(Math.random(0, 1) * multiplo), Math.floor(Math.random(0, 1) * multiplo));
  }

}

window.customElements.define('buscaminas-app', BuscaminasApp);
