
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
        this.currRow = -1;
        this.currCol = -1;
        this.fontSize = 10;
        this.canvaId = "0";

        this.rowsHeight;
        this.colswidth;


        this.canvaHeight = 0;
        this.canvaWidth = 0;
        this.cellHeight = 0;
        this.cellWidth = 0;
        this.rowNumber = 0;
        this.colNumber = 0;

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

    render() {
        // this._parent.appendChild(this._canva);s
        this.adjustCanvasDPI();
        let height = this.canvaHeight;
        let width = this.canvaWidth;

        this.ctx.lineWidth = 0.5;
        this.ctx.save();
        this.ctx.translate(0.5, 0.5);
        // Draw horizontal grid lines (rows)
        let y = 0;
        let ind;
        this.ctx.font = `${this.fontSize}px  'Courier New', monospace`;

        for (ind = 0; ind <= this.rowNumber; ind++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
            y += this.cellHeight;
        }
        // Draw vertical grid lines (columns)
        let x = 0;
        for (ind = 0; ind <= this.colNumber; ind++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
            x += this.cellWidth;
        }

        // to jump from the border;
        this.ctx.translate(0.5, 0.5);
        x = this.cellWidth / 2;
        y = this.cellHeight / 2 + 1;
        this.ctx.textAlign = "center";
        let charWidth = this.ctx.measureText("W").width;
        for (let r = 0; r < this.rowNumber; r++) {
            x = this.cellWidth / 2;
            for (let c = 0; c < this.colNumber; c++) {
                // let tmp = this.celldt[r][c].toString() ;
                let tmp = " ";
                tmp = tmp.slice(0, (this.cellWidth / charWidth) - 2);
                this.ctx.fillText(tmp, x, y);
                x += this.cellWidth;
            }
            y += this.cellHeight;
        }

        this.ctx.restore()

    }

    changeVal(r, c, val) {
        // Value-changing logic here
    }

    _initialize(cellHeight = 20, cellWidth = 100, rowNumber = 0, colNumber = 0) {

        this._canva.addEventListener('click', (e) => {
            this.rowColHandler(e.clientX, e.clientY);
        });

        this.cellHeight = cellHeight;
        this.cellWidth = cellWidth;
        this.rowNumber = rowNumber;
        this.colNumber = colNumber;
        this.canvaHeight = this.cellHeight * this.rowNumber + 1;
        this.canvaWidth = this.cellWidth * this.colNumber + 1;

        let rect = this._canva.getBoundingClientRect();
        this.canvaLeft = rect.left;
        this.canvaRight = rect.right;
        this.canvaTop = rect.top;
        this.canvaBottom = rect.bottom;

        this._canva.style.height = this.canvaHeight + "px";
        this._canva.style.width = this.canvaWidth + "px";

        this.render();
    }
}

class RowLabelCanva {
    constructor() {
        this.rowCountStart = 0;
        this.height = 0;
        this.width = 0;
        this.rowNumber = 0;
        this._canvaElm = document.createElement('canvas');
        this.ctx = this._canvaElm.getContext('2d')
    }

    render() {
        this._canvaElm.style.height = this.height + "px";
        this._canvaElm.style.width = this.width + "px";
        adjustCanvasDPI(this._canvaElm, this.ctx);
        this.ctx.clearRect(0, 0, this._canvaElm.width, this._canvaElm.height);
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this._canvaElm.width, this._canvaElm.height);
        this.ctx.strokeStyle = '#ccc';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#000';
        let rowHeight = this.height / this.rowNumber;
        for (let r = 0; r < this.rowNumber; r++) {
            const y = r * rowHeight;
            this.ctx.strokeRect(0, y, this.ctx.canvas.width, rowHeight);
            this.ctx.fillText((this.rowCountStart + r).toString(), this.ctx.canvas.width / 2, y + rowHeight / 2);
        }
    }

    initialize(rowNumber, height, width, rowCountStart) {
        this.rowNumber = rowNumber;
        this.height = height;
        this.width = width;
        this.rowCountStart = rowCountStart;
        this.render();

    }
}

class ColLabelCanva {

}


class masterRowManager {

    constructor() {
        this.rowSize = 0;
        this.rowsHeight = new Array(this.rowSize);
        this.prefixSum = new Array(this.rowSize);
        this.defRowH = 0;
    }

    initialize(rowHeight, rowSize) {
        this.rowSize = rowSize;
        this.defRowH = rowHeight;
        this.rowsHeight = new Array(this.rowSize);
        this.prefixSum = new Array(this.rowSize);
        for (let i = 0; i < this.rowSize; i++) {
            this.rowsHeight[i] = this.defRowH;
            this.prefixSum[i] = (i * this.defRowH) + this.defRowH;
        }
    }
}
class masterColManager {
    constructor() {
        this.colSize = 0;
        this.colsWidth = new Array(this.rowSize);
        this.prefixSum = new Array(this.rowSize);
        this.defColW = 0;
    }
    initialize(colWidth, colSize) {
        this.colSize = colSize;
        this.defColW = colWidth;
        this.colsWidth = new Array(this.colSize);
        this.prefixSum = new Array(this.colSize);

        for (let i = 0; i < this.colSize; i++) {
            this.colsWidth[i] = this.defColW;
            this.prefixSum[i] = (i * this.defColW) + this.defColW;
        }
    }
}

class CanvasManager {
    constructor() {
        this.rowLabelCanvaW = 50;
        this.colLabelCanvaH = 50;
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
        this.extraCanva = 1;
        this.totalCanvaVer = this.rows / this.rowsPerCanva;
        this.totalCanvaHor = this.cols / this.colsPerCanva;

        // vertical delta change for smooth scroll
        this.verDxForSmthScroll = 600;

        // horizontal delta change for smooth scroll
        this.horDxForSmthScroll = 600;
        // canvas vertical lower bound
        this.cnvRowLwrBnd = 0;

        // canvas vertical upper bound
        this.cnvRowUprBnd = 0;

        // canvas horizontal upper bound
        this.cnvColLwrBnd = 0;

        // canvas horizontal upper bound
        this.cnvColUprBnd = 0;

        this._render = true;

        this._isInstantRenderRequire = true;
    }

    removeRow(r) {
        if (r < 0 || r >= this.totalCanvaVer) {
            return;
        }
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
        if (c < 0 || c >= this.totalCanvaHor) {
            return;
        }
        let col = c;
        let row = this.cnvRowLwrBnd;

        for (; row <= this.cnvRowUprBnd; row++) {
            let elm = document.getElementById(`${row}_${col}`);
            if (elm) {
                this.canvaMagnagerElm.removeChild(elm);
            }
        }
    }

    appendRow(r, tp, isLabel = true) {
        const tmpRow = r;
        console.log(`append row of ${r}`)
        if (r == 2) {
            console.log()
        }
        if (r < 0 || r >= this.totalCanvaVer) {
            return;
        }


        let row = r;
        let col = this.cnvColLwrBnd;
        let left = col * this.canvaW;
        let top = r * (this.canvaH);
        for (; col <= this.cnvColUprBnd; col++) {
            const pstElm = document.getElementById(row + "_" + col);
            if (pstElm || col < 0 || col >= this.totalCanvaHor) {
                continue;
            }
            left = col * this.canvaW;
            let dt = new DataStorage();
            let elm = new Canva();
            this.canvaMagnagerElm.append(elm._canva);
            this.canvaMagnagerElm.append()
            elm._dataStg = dt;
            elm._initialize(this.cellHeight, this.cellWidth, this.rowsPerCanva, this.colsPerCanva);
            elm._canva.id = `${row}_${col}`;
            elm._canva.style.top = top + this.colLabelCanvaH + "px";
            elm._canva.style.left = left + this.rowLabelCanvaW + "px";
            // left += this.canvaW;
        }

        if (isLabel) {
            let labelElm = new RowLabelCanva();
            this.canvaMagnagerElm.append(labelElm._canvaElm);
            labelElm._canvaElm.id = `R${r}`;
            labelElm._canvaElm.style.left = "0px";
            labelElm._canvaElm.style.top = r * this.canvaH + this.colLabelCanvaH + "px";
            labelElm.initialize(this.rowsPerCanva, this.canvaH, this.rowLabelCanvaW, 0);
        }

    }

    appendCol(c, lt) {
        console.log(`append col of ${c}`)
        if (c < 0 || c >= this.totalCanvaHor) {
            return;
        }
        let col = c;
        let row = this.cnvRowLwrBnd;
        let left = col * this.canvaW;
        let top = 0;
        for (; row <= this.cnvRowUprBnd; row++) {
            const pstElm = document.getElementById(row + "_" + col);
            if (pstElm || row < 0 || row >= this.totalCanvaVer) {
                continue;
            }
            top = row * this.canvaH;
            let dt = new DataStorage();
            let elm = new Canva();
            this.canvaMagnagerElm.append(elm._canva);
            elm._dataStg = dt;
            elm._initialize(this.cellHeight, this.cellWidth, this.rowsPerCanva, this.colsPerCanva);
            elm._canva.id = `${row}_${col}`;
            elm._canva.style.top = top + this.colLabelCanvaH + "px";
            elm._canva.style.left = left + this.rowLabelCanvaW + "px";
            // top += this.canvaH;
        }


        // labels ;


    }

    clearChilds() {
        this.canvaMagnagerElm.innerHTML = "";
    }

    // flage 1 ---- > row render
    // flage 0 ---- > col render
    // flage 2 ---- > both need to be rerender
    instantScrollRender(flage) {
        if (!this._render || !this._isInstantRenderRequire) { return }
        const scrollLeft = Math.trunc(this.scrollLeft);
        const scrollTop = Math.trunc(this.scrollTop);

        let horInd = Math.trunc(scrollLeft / this.canvaW);
        let verInd = Math.trunc(scrollTop / this.canvaH);

        this.cnvColLwrBnd = horInd - this.extraCanva;
        this.cnvColUprBnd = horInd + this.canvasHorizontal + this.extraCanva - 1;
        this.cnvRowLwrBnd = verInd - this.extraCanva;
        this.cnvRowUprBnd = verInd + this.canvasVertical + this.extraCanva - 1;

        this.clearChilds();
        if (flage == 1 || flage == 2) {
            this.appendRow(verInd);
        }
        if (flage == 0 || flage == 2) {
            this.appendCol(horInd);
        }

        for (let i = 1; i <= this.extraCanva; i++) {
            if (flage == 1 || flage == 2) {
                this.appendRow(verInd - i);
                this.appendRow(verInd + i);
            }
            if (flage == 0 || flage == 2) {
                this.appendCol(horInd - i);
                this.appendCol(horInd + i);
            }
        }
        this._isInstantRenderRequire = false;
    }
    smoothScrollRender(isVerticalMove) {
        if (!this._render) { return }
        if (!isVerticalMove) {
            const scrollLeft = Math.trunc(this.scrollLeft);
            let horInd = Math.trunc(scrollLeft / this.canvaW);

            // For Horizontal
            if (horInd >= 1) {
                console.log();
            }
            if ((horInd + this.canvasHorizontal + this.extraCanva) > this.cnvColUprBnd + 1) {
                this.removeCol(this.cnvColLwrBnd);
                this.cnvColUprBnd = horInd + this.canvasHorizontal + this.extraCanva - 1;
                this.cnvColLwrBnd = horInd - this.extraCanva;
                this.appendCol(this.cnvColUprBnd, (this.viewPortWidth + this.scrollTop - this.canvaW));
            }
            else if (horInd - this.extraCanva < this.cnvColLwrBnd) {
                this.removeCol(this.cnvColUprBnd);
                this.cnvColUprBnd = horInd + this.canvasHorizontal + this.extraCanva - 1;;
                this.cnvColLwrBnd = horInd - this.extraCanva;
                this.appendCol(this.cnvColLwrBnd, (0));
            }
        }
        else {
            // For vertical
            const scrollTop = Math.trunc(this.scrollTop);
            let verInd = Math.trunc(scrollTop / this.canvaH);
            if ((verInd + this.canvasVertical + this.extraCanva) > this.cnvRowUprBnd + 1) {
                this.removeRow(this.cnvRowLwrBnd);
                this.cnvRowUprBnd = verInd + this.canvasVertical + this.extraCanva - 1;
                this.cnvRowLwrBnd = verInd - this.extraCanva;
                this.appendRow(this.cnvRowUprBnd, (this.viewPortHeight - this.canvaH));
            }
            else if (verInd - this.extraCanva < this.cnvRowLwrBnd) {
                this.removeRow(this.cnvRowUprBnd);
                this.cnvRowUprBnd = verInd + this.canvasVertical + this.extraCanva - 1;
                this.cnvRowLwrBnd = verInd - this.extraCanva;
                this.appendRow(this.cnvRowLwrBnd, (0));
            }
        }

    }

    initialize() {
        this.viewPort.addEventListener('scroll', () => {
            let dx = Math.abs(this.scrollLeft - this.viewPort.scrollLeft);
            let dy = Math.abs(this.scrollTop - this.viewPort.scrollTop);

            // console.log(`dx: ${dx}, dy: ${dy}`)
            this.scrollTop = this.viewPort.scrollTop;
            this.scrollLeft = this.viewPort.scrollLeft;

            if (dx >= this.horDxForSmthScroll || dy >= this.verDxForSmthScroll) {
                this._render = false;
                this._isInstantRenderRequire = true;
            }
            else {
                this._render = true;
            }
            if (dx > 0) {
                if (dx <= this.horDxForSmthScroll && !this._isInstantRenderRequire) {
                    this.smoothScrollRender(false);
                }
            }

            if (dy > 0) {
                if (dy <= this.horDxForSmthScroll && !this._isInstantRenderRequire) {
                    this.smoothScrollRender(true);
                }
            }
        });

        this.viewPort.addEventListener('scrollend', () => {
            // console.log("scrollend trigger")
            this._render = true;
            if (this._isInstantRenderRequire) {
                this.instantScrollRender(2);
            }
        })
        this.canvaMagnagerElm.style.height = this.height + "px";
        this.canvaMagnagerElm.style.width = this.width + "px";
        this.instantScrollRender(2);
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



function adjustCanvasDPI(canvaElm, ctx) {
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvaElm.clientWidth;
    const cssHeight = canvaElm.clientHeight;

    // Set the internal pixel size of the canvas

    canvaElm.width = cssWidth * dpr;
    canvaElm.height = cssHeight * dpr;

    // Set the CSS size so it stays visually the same size on screen
    canvaElm.style.width = `${cssWidth}px`;
    canvaElm.style.height = `${cssHeight}px`;

    // this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}
// const dt = DataStorage();
// const canva = new Canva();

// canva._dataStg = dt;

// canva._initialize();
// canva.render();

// canva.render();


