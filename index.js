
class CellManger {
    constructor() {
        this.padding = 0;
    }

}

class RowManager {
    constructor() {
        this.RowsHeight = null;
        this.RowHeight = null;
        this.totalHeigh = null;
        this.prefSum = null;
        this.rowNumber = null;
    }

    adjuctHeight(rowNum, height) {
        this.RowsHeight[rowNum] = height;
        this.prefixSumUpdate(rowNum);
    }

    prefixSumUpdate(rowInd) {
        for (let i = rowInd; i < this.rowNumber; i++) {
            this.prefSum[i] = (i > 0 ? this.prefSum[i - 1] : 0) + this.RowsHeight[i];
        }
        this.totalHeigh = this.prefSum[this.rowNumber - 1];
    }

    initialize() {
        if (!this.prefSum) {
            this.prefSum = new Array(this.rowNumber);
        }
        if (!this.RowsHeight) {
            this.RowsHeight = new Array(this.rowNumber);
        }
        if (this.RowHeight !== null) {
            this.totalHeigh = 0;
            for (let i = 0; i < this.rowNumber; i++) {
                this.RowsHeight[i] = this.RowHeight;
                this.totalHeigh += this.RowHeight;
            }
            for (let i = 0; i < this.rowNumber; i++) {
                this.prefSum[i] = (i > 0 ? this.prefSum[i - 1] : 0) + this.RowsHeight[i];
            }
        }
    }
}

class ColumnManager {
    constructor() {
        this.colNumber = null;
        this.prefSum = null;
        this.ColumnsWidth = null;
        this.ColumnWidth = null;
        this.totalWidth = 0;
    }

    adjuctWidth(colNumber, width) {
        this.ColumnsWidth[colNumber] = width;
        this.prefixSumUpdate(colNumber);
    }

    prefixSumUpdate(colInd) {
        for (let i = colInd; i < this.colNumber; i++) {
            this.prefSum[i] = (i > 0 ? this.prefSum[i - 1] : 0) + this.ColumnsWidth[i];
        }
        this.totalWidth = this.prefSum[this.colNumber - 1];
    }

    initialize() {
        if (!this.prefSum) {
            this.prefSum = new Array(this.colNumber);
        }
        if (!this.ColumnsWidth) {
            this.ColumnsWidth = new Array(this.colNumber);
        }
        if (this.ColumnWidth !== null) {
            this.totalWidth = 0;
            for (let i = 0; i < this.colNumber; i++) {
                this.ColumnsWidth[i] = this.ColumnWidth;
                this.totalWidth += this.ColumnWidth;
            }
            for (let i = 0; i < this.colNumber; i++) {
                this.prefSum[i] = (i > 0 ? this.prefSum[i - 1] : 0) + this.ColumnsWidth[i];
            }
        }
    }
}

class Canva {
    constructor() {
        this._dataStg = null;
        this.celldt = null;
        this._canva = document.getElementById('canvasContainer');
        this.ctx = this._canva.getContext('2d');
        this.rowM = new RowManager();
        this.colM = new ColumnManager();
        this.currRow = 0;
        this.currCol = 0;
        this.fontSize = 5;
    }

    adjustCanvasDPI() {
        const dpr = window.devicePixelRatio || 2;
        const cssWidth = this._canva.clientWidth;
        const cssHeight = this._canva.clientHeight;

        // Set the internal pixel size of the canvas
        this._canva.width = cssWidth * dpr;
        this._canva.height = cssHeight * dpr;

        // Set the CSS size so it stays visually the same size on screen
        this._canva.style.width = `${cssWidth}px`;
        this._canva.style.height = `${cssHeight}px`;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        this.render();
    }


    rowColHandler(x, y) {
        // Handler logic can go here
    }

    getSlicedTxt(txt, start, end,) {

    }

    render() {
        let height = this.rowM.totalHeigh;
        let width = this.colM.totalWidth;

        this.ctx.lineWidth = 0.5;
        this.ctx.save();
        this.ctx.translate(0.5, 0.5);
        // Draw horizontal grid lines (rows)
        let y = 0;
        let ind;
        this.ctx.font = `${this.fontSize}px  'Courier New', monospace`;

        for (ind = 0; ind <= this.rowM.rowNumber; ind++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
            y += this.rowM.RowsHeight[ind];
        }
        // Draw vertical grid lines (columns)
        let x = 0;
        for (ind = 0; ind <= this.colM.colNumber; ind++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
            x += this.colM.ColumnsWidth[ind];
        }

        // to jump from the border;
        this.ctx.translate(0.5, 0.5);
        x = this.colM.ColumnWidth / 2;
        y = this.rowM.RowHeight / 2 + 1;
        this.ctx.textAlign = "center";
        let charWidth = this.ctx.measureText("W").width;
        for (let r = 0; r < this.rowM.rowNumber; r++) {
            x = this.colM.ColumnWidth / 2;
            for (let c = 0; c < this.colM.colNumber ; c++) {
                let tmp = this.celldt[r][c].toString();
                console.log(this.colM.ColumnWidth / charWidth )
                tmp = tmp.slice(0, ( this.colM.ColumnWidth / charWidth ) - 2 );
                console.log(tmp)
                this.ctx.fillText(tmp, x, y);
                x += this.colM.ColumnsWidth[c];
            }
            y += this.rowM.RowsHeight[r];
        }

        this.ctx.restore()
    }

    changeVal(r, c, val) {
        // Value-changing logic here
    }

    _initialize(rowHeight = 10, colWidth = 50) {
        this._canva.addEventListener('pointermove', (e) => {
            this.rowColHandler(e.clientX, e.clientY);
        });

        this.rowM.RowHeigts = rowHeight;  // Seems like a typo, should be RowHeight
        this.rowM.rowNumber = this._dataStg.rowNumber;
        this.colM.colNumber = this._dataStg.colNumber;
        this._canva.height = (100 * rowHeight);
        this._canva.width = (100 * colWidth);
        this.rowM.RowHeight = rowHeight;
        this.colM.ColumnWidth = colWidth;

        // Init cell data
        this.celldt = new Array(this.rowM.rowNumber);
        for ( let i = 0; i < this.rowM.rowNumber; i++ ) {
            let narr = new Array(this.colM.colNumber).fill( 0 );
            this.celldt[i] = narr;
            for (let j = 0; j < this.colM.colNumber; j++) {
                if (this._dataStg.cellData && this._dataStg.cellData[i] && this._dataStg.cellData[i][j]) {
                    this.celldt[i][j] = this._dataStg.cellData[i][j]
                }
                else {
                    this.celldt[i][j] = "";
                }
            }
        }

        this.rowM.initialize();
        this.colM.initialize();
        this.adjustCanvasDPI();
    }
}




function DataStorage() {
    this.cellData = [
        [5, 5, 8, 5, "0000000000000000000000000000000"],
        [5, 5, 8, 5, 10],
        [5, 5, 8, 5, 10],
        [5, 5, 8, 5, 10],
        [5, 5, 8, 5, 10]
    ];
    this.rowNumber = 10;
    this.colNumber = 10;

    return this;
}

const dt = DataStorage();
const canva = new Canva();

canva._dataStg = dt;

canva._initialize();

// canva.render();


