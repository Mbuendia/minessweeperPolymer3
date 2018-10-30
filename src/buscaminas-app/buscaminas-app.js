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

  _checkPosition(bombPosition) {
    return this.row === bombPosition.row && this.column === bombPosition.column;
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
        .mina {
          color: #D7DBDD;
          background-color: #D7DBDD;
          border: 1px solid #797D7F;
          padding: .5rem;
          cursor: pointer;
          width: 13px;
          height: 13px;
          transition: easy-in 1s 2s;
          color: transparent;
        }

        .bomb{
          display: flex;
          font-size: 1em;
          align-items: center;
          color: black;

          transition: easy-in 1s 2s;
        }
        
        .container {
          border: 2px solid black;
          display: flex;
        }
        
        .mina:hover {
          background-color: #34495E
        }
        
        .mina:active {
          background-color: #3e8e41;
          transform: translateY(4px);
        }
        
        .show {
          border: 1px solid #D5DBDB;
          background-color: #EAEDED;
          cursor: default;
        }
        
        .zero {
          border: 1px solid #D5DBDB;
          background-color: #EAEDED;
          color: transparent;
        }
        
        .row {
          display: table-cell;
        }
        
        .warm1 {
          color: green;
        }
        
        .warm2 {
          color: blue;
        }
        
        .warm3 {
          color: orange;
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
      },
      multiplo: Number,
      bombsArray: {
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
      if (mine.mineValue !== '0') {
        domCell.baseNode.parentElement.className = `mina show warm${domCell.baseNode.parentElement.innerText}`;
      } else {
        this._doMalla(column, row, mine, domCell);
      }
  }
  

  _doMalla(column, row, mine, domCell) {
    for (let columnsearch = column - 1; columnsearch <= column + 1; columnsearch++) {
      for (let rowsearch = row - 1; rowsearch <= row + 1; rowsearch++) {
        if (new Position(columnsearch, rowsearch)._validPositionInMatrix(this.matriz)) {
          if (this.matriz[columnsearch][rowsearch].value === 0) {
            if (this.shadowRoot.children.item(1).children.item(columnsearch).children.item(rowsearch).className !== 'mina zero') {
              this.shadowRoot.children.item(1).children.item(columnsearch).children.item(rowsearch).className = 'mina zero';
              Object.assign(mine, { mineValue: this.matriz[columnsearch][rowsearch].value.toString(), mineRow: rowsearch, mineColumn: columnsearch});
              this._checkNonMines(mine, domCell);
              console.log(mine);
            }
          }
          else {
            this.shadowRoot.children.item(1).children.item(columnsearch).children.item(rowsearch).className = `mina show warm${this.shadowRoot.children.item(1).children.item(columnsearch).children.item(rowsearch).innerText}`;
          }
        }
      }
    }
  }

  _checkBomb(bomb) {
    let value = bomb.baseNode.data;       
    let row = this._getRow(bomb);
    let column = this._getColum(bomb);
    let mine = { mineValue: value, mineRow: row, mineColumn: column };
    if (mine.mineValue === 'b') {
      new Notification('bomba!', {});
      this.bombsArray.forEach(bomb => {

        this.shadowRoot.children.item(1).children.item(bomb.column).children.item(bomb.row).innerHTML ='💣';
        this.shadowRoot.children.item(1).children.item(bomb.column).children.item(bomb.row).className='mina show bomb';
      });

      //setTimeout(this.init(), 10000);
      
    } else {
      this._checkNonMines(mine, bomb);
    }
  }

  _clickMine(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    let selection = ev.currentTarget.root.getSelection();
    if (selection.type !== 'Range' && selection.baseNode.parentElement.classList[1] !== 'zero' && selection.baseNode.parentElement.classList[1] !== 'show') {
      this._checkBomb(selection);
    }
  }

  _setrow(row) {
    let rowFormatted = [];
    rowFormatted = row.map((ele, a) => {
      let classMine = (ele.show) ? 'show' : 'hide';
      return `<div class="mina ${classMine}" id="${a}">${ele.value}</div>`
    });
    rowFormatted = rowFormatted.join('');
    return rowFormatted;
  }

  init() {
    let multiplo = 16;
    let minas = 40;
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
    this.push('bombsArray', position);
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
    let bombPosition;
    do {
      bombPosition = new Position(Math.floor(Math.random(0, 1) * multiplo), Math.floor(Math.random(0, 1) * multiplo));
    } while (this.bombsArray.find(bomb => bomb._checkPosition(bombPosition)));
    return  bombPosition;
  }

}

window.customElements.define('buscaminas-app', BuscaminasApp);
