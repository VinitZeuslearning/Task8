
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
        const dpr = window.devicePixelRatio || 1;
        const cssWidth = this._canva.clientWidth;
        const cssHeight = this._canva.clientHeight;

        // Set the internal pixel size of the canvas

        this._canva.width = cssWidth * dpr;
        this._canva.height = cssHeight * dpr;

        // Set the CSS size so it stays visually the same size on screen
        this._canva.style.width = `${cssWidth}px`;
        this._canva.style.height = `${cssHeight}px`;

        // this.ctx.setTransform(1, 0, 0, 1, 0, 0);
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
        //console.log(`running for ${x} ${y}`)
        this.currRow = Canva.performBinarySearch(this.rowM.prefSum, y);
        this.currCol = Canva.performBinarySearch(this.colM.prefSum, x);
        //console.log(` Row : ${this.currRow} Col : ${this.currCol}`);
    }

    render() {
        // this._parent.appendChild(this._canva);s
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
        this.render();
    }
}


class CanvasManager {
    constructor() {
        this.rows = 100000;
        this.cols = 500;
        this.cellWidth = 100;
        this.cellHeight = 20;
        this.rowsPerCanva = 20;
        this.colsPerCanva = 8;
        this.elmsPerCava = this.rowsPerCanva * this.colsPerCanva;
        this.canvaMagnagerElm = document.getElementById('canvaManager');
        this.viewPort = document.getElementById('InnerContiner');
        this.viewPortRect = this.viewPort.getBoundingClientRect();
        this.canvaH = this.rowsPerCanva * this.cellHeight;
        this.canvaW = this.colsPerCanva * this.cellWidth;
        this.canvasHorizontal = (Math.ceil(this.viewPortRect.width / this.canvaW));
        this.canvasVertical = (Math.ceil(this.viewPortRect.height / this.canvaH));
        this.scrollTop = 0;
        this.scrollLeft = 0;
        this.viewPortHeight = this.viewPortRect.height;
        this.viewPortWidth = this.viewPortRect.width;
        this.height = this.rows * this.cellHeight;
        this.width = this.cols * this.cellWidth;
        this.extraCanva = 2;
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
            if (elm) {
                this.canvaMagnagerElm.removeChild(elm);
            }
        }
    }

    removeCol(c) {
        let col = c;
        let row = this.cnvRowLwrBnd;

        for (; row <= this.cnvRowUprBnd; row++) {
            let elm = document.getElementById(`${row}_${col}`);
            if (elm) {
                this.canvaMagnagerElm.removeChild(elm);
            }
        }
    }

    appendRow(r, tp) {
        let row = r;
        let col = this.cnvColLwrBnd;
        let left = col * this.canvaW;
        let top = r * (this.canvaH);
        for (; col <= this.cnvColUprBnd; col++) {
            const pstElm = document.getElementById(row + "_" + col);
            if (pstElm) {
                continue;
            }
            left = col * this.canvaW;
            let dt = new DataStorage();
            let elm = new Canva();
            this.canvaMagnagerElm.append(elm._canva);
            elm._dataStg = dt;
            elm._initialize();
            elm._canva.id = `${row}_${col}`;
            elm._canva.style.top = top + "px";
            elm._canva.style.left = left + "px";
            // left += this.canvaW;
        }
    }

    appendCol(c, lt) {
        let col = c;
        let row = this.cnvRowLwrBnd;
        let left = col * this.canvaW;
        let top = 0;
        for (; row <= this.cnvRowUprBnd; row++) {
            const pstElm = document.getElementById(row + "_" + col);
            if (pstElm) {
                continue;
            }
            top = row * this.canvaH;
            let dt = new DataStorage();
            let elm = new Canva();
            this.canvaMagnagerElm.append(elm._canva);
            elm._dataStg = dt;
            elm._initialize();
            elm._canva.id = `${row}_${col}`;
            elm._canva.style.left = left + "px";
            elm._canva.style.top = top + "px";
            // top += this.canvaH;
        }
    }

    clearChilds() {
        this.canvaMagnagerElm.innerHTML = "";
    }

    render(isVerticalMove) {
        this.scrollTop = this.viewPort.scrollTop;
        this.scrollLeft = this.viewPort.scrollLeft;
        //console.log(`${this.scrollLeft}   ${this.scrollTop}`)
        const scrollLeft = Math.trunc(this.scrollLeft);
        const scrollTop = Math.trunc(this.scrollTop);

        let horInd = Math.trunc(scrollLeft / this.canvaW);
        let verInd = Math.trunc(scrollTop / this.canvaH);

        this.clearChilds();
        if (isVerticalMove) {
            this.appendRow(verInd);
        }
        else {
            this.appendCol(horInd);
        }

        for (let i = 1; i <= this.extraCanva; i++) {
            if ( isVerticalMove ) {
                this.appendRow( verInd - i );
                this.appendRow( verInd + i );
            }
            else {
                this.appendCol( horInd - i );
                this.appendCol( horInd + i );
            }
        }
    }
    handleScroll() {
        this.scrollTop = this.viewPort.scrollTop;
        this.scrollLeft = this.viewPort.scrollLeft;
        //console.log(`${this.scrollLeft}   ${this.scrollTop}`)
        const scrollLeft = Math.trunc(this.scrollLeft);
        const scrollTop = Math.trunc(this.scrollTop);

        let horInd = Math.trunc(scrollLeft / this.canvaW);
        let verInd = Math.trunc(scrollTop / this.canvaH);
        //console.log(`scroll triggerd  ${verInd}`);
        if (verInd >= 1) {
            //console.log("sdf")
        }
        // For Horizontal
        if ((horInd + this.canvasHorizontal) > this.cnvColUprBnd + 1) {
            this.removeCol(this.cnvColLwrBnd);
            this.cnvColUprBnd = horInd + this.canvasHorizontal - 1;
            this.cnvColLwrBnd = horInd;
            this.appendCol(this.cnvColUprBnd, (this.viewPortWidth + this.scrollTop - this.canvaW));
        }
        else if (horInd < this.cnvColLwrBnd) {
            this.removeCol(this.cnvColUprBnd);
            this.cnvColUprBnd = horInd + this.canvasHorizontal - 1;;
            this.cnvColLwrBnd = horInd;
            this.appendCol(this.cnvColLwrBnd, (0));
        }


        // For vertical

        if ((verInd + this.canvasVertical) > this.cnvRowUprBnd + 1) {
            this.removeRow(this.cnvRowLwrBnd);
            this.cnvRowUprBnd = verInd + this.canvasVertical - 1;
            this.cnvRowLwrBnd = verInd;
            this.appendRow(this.cnvRowUprBnd, (this.viewPortHeight - this.canvaH));
        }
        else if (verInd < this.cnvRowLwrBnd) {
            this.removeRow(this.cnvRowUprBnd);
            this.cnvRowUprBnd = verInd + this.canvasVertical - 1;
            this.cnvRowLwrBnd = verInd;
            this.appendRow(this.cnvRowLwrBnd, (0));
        }
    }

    initialLoad() {
        this.cnvColLwrBnd = 0;
        this.cnvColUprBnd = this.canvasHorizontal - 1;
        this.cnvRowLwrBnd = 0;
        this.cnvRowUprBnd = this.canvasVertical - 1;
        let row = 0;
        for (let r = this.cnvRowLwrBnd; r <= this.cnvRowUprBnd; r++) {
            this.appendRow(r, row);
            row += this.canvaH;
        }
    }
    throttle(fn, limit) {
        let inThrottle = false;
        return function (...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    initialize() {
        // const throttledScroll = this.throttle(this.handleScroll.bind(this), 50);
        // this.viewPort.addEventListener('scroll', (e) => { throttledScroll });
        // this.viewPort.addEventListener('scroll', throttledScroll);
        this.viewPort.addEventListener('scroll', (e) => { this.handleScroll() });
        this.canvaMagnagerElm.style.height = this.height + "px";
        this.canvaMagnagerElm.style.width = this.width + "px";
        this.initialLoad();
    }
}




const canvaM = new CanvasManager;

canvaM.initialize();


function DataStorage() {
    this.cellData = [

    ];
    this.rowNumber = 20;
    this.colNumber = 8;

    return this;
}

// const dt = DataStorage();
// const canva = new Canva();

// canva._dataStg = dt;

// canva._initialize();
// canva.render();

// canva.render();


