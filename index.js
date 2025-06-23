
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
        this.canvaTop = 0;
        this.canvaLeft = 0;
        this.canvaBottom = 0;
        this.canvaRight = 0;
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
            this.prefSum = new Array(this.rowNumber + 2);
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
            this.prefSum[0] = this.canvaTop;
            for (let i = 1; i <= this.rowNumber; i++) {
                this.prefSum[i] = this.prefSum[i - 1] + this.RowsHeight[i - 1];
            }
            this.prefSum[this.rowNumber + 1] = this.canvaBottom;
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
        this.canvaTop = 0;
        this.canvaLeft = 0;
        this.canvaBottom = 0;
        this.canvaRight = 0;
        this.colResize = document.getElementById('ColumnResize');
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
            this.prefSum = new Array(this.colNumber + 2);
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
            this.prefSum[0] = this.canvaLeft;
            for (let i = 1; i <= this.colNumber; i++) {
                this.prefSum[i] = this.prefSum[i - 1] + this.ColumnsWidth[i - 1];
            }
            this.prefSum[this.colNumber + 1] = this.canvaRight;
        }

        for (let i = 0; i < this.colNumber; i++) {

        }
    }
}

class Canva {
    constructor() {
        this._dataStg = null;
        this.celldt = null;
        this.canvaTop = 0;
        this.canvaLeft = 0;
        this.canvaBottom = 0;
        this.canvaRight = 0;
        this._parent = document.getElementById('canvaManager');
        this._canva = document.createElement('canvas');
        this.ctx = this._canva.getContext('2d');
        this.rowM = new RowManager();
        this.colM = new ColumnManager();
        this.currRow = -1;
        this.currCol = -1;
        this.fontSize = 10;
        this.canvaId = "0";
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
    }

    static performBinarySearch(arr, num) {
        if (num > arr[arr.length - 1] || num < arr[0]) {
            return -1;
        }
        let i = 0;
        let j = arr.length - 1;


        let mid;
        while (i < j) {
            mid = Math.ceil(i + ((j - i) / 2));

            if (arr[mid] > num) {
                j = mid - 1;
            }
            else {
                i = mid;
            }
        }
        return i;
    }
    rowColHandler(x, y) {
        // Handler logic can go here
        console.log(`running for ${x} ${y}`)
        this.currRow = Canva.performBinarySearch(this.rowM.prefSum, y);
        this.currCol = Canva.performBinarySearch(this.colM.prefSum, x);
        console.log(` Row : ${this.currRow} Col : ${this.currCol}`);
    }

    render() {
        this._parent.appendChild(this._canva);
        this.adjustCanvasDPI();
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
            for (let c = 0; c < this.colM.colNumber; c++) {
                let tmp = this.celldt[r][c].toString();
                tmp = tmp.slice(0, (this.colM.ColumnWidth / charWidth) - 2);
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

    _initialize(rowHeight = 20, colWidth = 100) {
        this._canva.addEventListener('click', (e) => {
            this.rowColHandler(e.clientX, e.clientY);
        });

        let rect = this._canva.getBoundingClientRect();
        this.canvaLeft = rect.left;
        this.canvaRight = rect.right;
        this.canvaTop = rect.top;
        this.canvaBottom = rect.bottom;
        this.rowM.RowHeigts = rowHeight;
        this.rowM.rowNumber = this._dataStg.rowNumber;
        this.colM.colNumber = this._dataStg.colNumber;
        this._canva.style.height = rowHeight * (this.rowM.rowNumber) + 1 + "px";
        this._canva.style.width = colWidth * (this.colM.colNumber) + 1 + "px";
        this.rowM.RowHeight = rowHeight;
        this.colM.ColumnWidth = colWidth;
        this.rowM.canvaTop = this.canvaTop;
        this.rowM.canvaBottom = this.canvaBottom;
        this.rowM.canvaRight = this.canvaRight;
        this.rowM.canvaLeft = this.canvaLeft;
        this.colM.canvaTop = this.canvaTop;
        this.colM.canvaBottom = this.canvaBottom;
        this.colM.canvaRight = this.canvaRight;
        this.colM.canvaLeft = this.canvaLeft;

        // Init cell data
        this.celldt = new Array(this.rowM.rowNumber);
        for (let i = 0; i < this.rowM.rowNumber; i++) {
            let narr = new Array(this.colM.colNumber).fill(0);
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
    }
}


class CanvasManager {
    constructor() {
        this.rows = 100000;
        this.cols = 500;
        this.rowsPerCanva = 20;
        this.colsPerCanva = 8;
        this.elmsPerCava = this.rowsPerCanva * this.colsPerCanva;
        this.canvaMagnagerElm = document.getElementById('canvaManager');
        this.viewPort = document.getElementById('canvaManagerContainer');
        this.height = this.rows * 20;
        this.width = this.cols * 50;
        this.canvaH = this.rowsPerCanva * 20;
        this.canvaW = this.colsPerCanva * 50;
        this.canvasHorizontal = (Math.ceil(this.viewPort.style.width / this.canvaW)) + 2;
        this.canvasVertical = (Math.ceil(this.viewPort.style.height / this.canvaH)) + 2;

        // canvas vertical lower bound
        this.cnvRowLwrBnd = 0;

        // canvas vertical upper bound
        this.cnvRowUprBnd = 0;

        // canvas horizontal upper bound
        this.cnvColLwrBnd = 0;

        // canvas horizontal upper bound
        this.cnvColUprBnd = 0;
    }

    removeRow(r) {
        let row = r;
        let col = this.cnvColLwrBnd;
        for (; col <= this.cnvColUprBnd; col++) {
            let elm = document.getElementById(`${row}_${col}`);
            this.canvaMagnagerElm.remove(elm);
        }
    }
    removeCol(c) {
        let col = c;
        let row = this.cnvRowLwrBnd;

        for (; row <= this.cnvRowUprBnd; row++) {
            let elm = document.getElementById(`${row}_${col}`);
            this.canvaMagnagerElm.remove(elm);
        }
    }

    appendRow(){}
    appendCol(){}

    handleScroll() {
        const scrollLeft = this.viewPort.scrollLeft;
        const scrollTop = this.viewPort.scrollTop;
        let horInd = (scrollLeft / this.canvaW);
        let verInd = scrollTop / this.canvaH;

        // For Horizontal
        if ((horInd + this.canvasHorizontal) > this.cnvColUprBnd) {
            let oldElm = document.getElementById(`${this.cnvRowLwrBnd}_${this.cnvColLwrBnd}`);

            // initilize it
            let newElm = new Canva()

            this.canvaMagnagerElm.remove(oldElm);
            this.cnvColLwrBnd++;
            this.cnvColUprBnd++;
            newElm.id = `${this.cnvRowUprBnd}_${this.cnvColUprBnd}`;
            this.canvaMagnagerElm.append(newElm);
        }
        else if (horInd < this.cnvColLwrBnd) {
            let oldElm = document.getElementById(`${this.cnvRowUprBnd}_${this.cnvColUprBnd}`);

            let newElm = new Canva();
            this.canvaMagnagerElm.remove(oldElm);
            this.cnvColUprBnd--;
            this.cnvColLwrBnd--;

            newElm.id = `${this.cnvRowLwrBnd}_${this.cnvColUprBnd}`;
            this.canvaMagnagerElm.append(newElm);
        }


        // For vertical

        if ((verInd + this.canvasVertical) > this.cnvRowUprBnd) {
            let oldElm = document.getElementById(`${this.cnvRowLwrBnd}_${this.cnvColLwrBnd}`);
        }
    }
    initialize() {
        this.canvaMagnagerElm.addEventListener('scroll', (e) => { });
        this.canvaMagnagerElm.style.height = this.height + "px";
        this.canvaMagnagerElm.style.width = this.width + "px";
    }
}


const canvaM = new CanvasManager;

canvaM.initialize();


// function DataStorage() {
//     this.cellData = [
//         [5, 5, 8, 5, "0000000000000000000000000000000"],
//         [5, 5, 8, 5, 10],
//         [5, 5, 8, 5, 10],
//         [5, 5, 8, 5, 10],
//         [5, 5, 8, 5, 10]
//     ];
//     this.rowNumber = 5;
//     this.colNumber = 5;

//     return this;
// }

// const dt = DataStorage();
// const canva = new Canva();

// canva._dataStg = dt;

// canva._initialize();
// canva.render();

// canva.render();


