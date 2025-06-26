// import RCManager from "./rcManager";


class CnvRcManager {
  constructor(size, defaultValue) {
    this.size = size;
    this.defaultValue = defaultValue;
    this.values = new Map();           // Sparse storage

    this.prefixSum = new Array( size);
    this.rebuildPrefixSum();
  }

  rebuildPrefixSum() {
    this.prefixSum[0] = 0;
    for (let i = 1; i < this.size; i++) {
      this.prefixSum[i] = this.prefixSum[i - 1] + this.getValue(i);
    }
  }

  update(index, newValue) {
    if (newValue === this.defaultValue) {
      this.values.delete(index);
    } else {
      this.values.set(index, newValue);
    }
    for (let i = index; i < this.size; i++) {
      if (i === 0) this.prefixSum[i] = this.getValue(i);
      else this.prefixSum[i] = this.prefixSum[i - 1] + this.getValue(i);
    }
  }

  getValue(index) {
    return this.values.has(index) ? this.values.get(index) : this.defaultValue;
  }

  getPrefixSum() {
    return this.prefixSum;
  }

  getPrefVal( index ) {
    return this.prefixSum[ index ];
  }

  getSumUpto(index) {
    return this.prefixSum[index];
  }
}




class RCManager {
  constructor(number, defaultUnit, numberPerCanva) {
    this.size = number;
    this.defaultUnit = defaultUnit;
    this.numberPerCanva;
    this.values = new Map();
    this.cnvdM = new CnvRcManager( Math.ceil( number / numberPerCanva ), defaultUnit * numberPerCanva);
  }

  update(index, newValue) {
    if (newValue === this.defaultUnit) {
      this.values.delete(index);
    } else {
      this.values.set(index, newValue);
    }
  }

  getValue(index) {
    return this.values.has(index) ? this.values.get(index) : this.defaultUnit;
  }
}










//**************************************************************************************************** */
















































class RowLabelCanva {
    constructor() {
        this.rowCountStart = 0;
        this.height = 0;
        this.width = 0;
        this.rowNumber = 0;
        this._canvaElm = document.createElement('canvas');
        this.ctx = this._canvaElm.getContext('2d');
        this._canvaElm.style.zIndex = 2;
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
    constructor() {
        this.colCountStart = "A";
        this.height = 25;
        this.width = 100;
        this.colNumber = 0;
        this._canvaElm = document.createElement('canvas');
        this.ctx = this._canvaElm.getContext('2d');
        this._canvaElm.style.zIndex = 2;
    }

    render() {
        this._canvaElm.style.height = this.height + "px";
        this._canvaElm.style.width = this.width + "px";
        adjustCanvasDPI(this._canvaElm, this.ctx);
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.strokeStyle = '#ccc';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#000';

        let colWidth = this.width / this.colNumber;
        let label = this.colCountStart;
        for (let c = 0; c < this.colNumber; c++) {
            const x = c * colWidth;
            label = this.getNextColumnLabel(label);
            this.ctx.strokeRect(x, 0, colWidth, this.ctx.canvas.height);
            this.ctx.fillText(label, x + colWidth / 2, this.ctx.canvas.height / 2);
        }
    }
    static getColumnLabelFromNumber(num) {
        let label = '';
        while (num > 0) {
            num--; // adjust because Excel is 1-based
            label = String.fromCharCode(65 + (num % 26)) + label;
            num = Math.floor(num / 26);
        }
        return label;
    }

    initialize(colNumber, height, width, colCountStartNumber = 0) {
        this.colNumber = colNumber;
        this.height = height;
        this.width = width;
        this.colCountStart = ColLabelCanva.getColumnLabelFromNumber(colCountStartNumber);
        this.render();
    }

    getNextColumnLabel(colLabel) {
        let carry = 1;
        let result = '';

        for (let i = colLabel.length - 1; i >= 0; i--) {
            const charCode = colLabel.charCodeAt(i) - 65;
            const sum = charCode + carry;
            if (sum === 26) {
                result = 'A' + result;
                carry = 1;
            } else {
                result = String.fromCharCode(65 + sum) + result;
                carry = 0;
            }
        }
        if (carry === 1) result = 'A' + result;
        return result;
    }

    getCanvasElement() {
        return this._canvaElm;
    }
}


class Canva {
    constructor() {
        this._dataStg = null;
        this.celldt = null;
        this._parent = document.getElementById('canvaManager');
        this._canva = document.createElement('canvas');
        this.ctx = this._canva.getContext('2d');
        this.currRow = -1;
        this.currCol = -1;
        this.fontSize = 10;
        this.rowsHeight;
        this.colswidth;
        this.canvaHeight = 0;
        this.canvaWidth = 0;
        this.cellHeight = 0;
        this.cellWidth = 0;
        this.rowNumber = 0;
        this.colNumber = 0;
        this.masterHobj = null;
        this.masterWobj = null;
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
            // y += this.cellHeight;
            y += this.masterHobj.getValue(ind);
        }

        // Draw vertical grid lines (columns)
        let x = 0;
        for (ind = 0; ind <= this.colNumber; ind++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
            // x += this.cellWidth;
            x += this.masterWobj.getValue(ind);
        }

        // to jump from the border;
        this.ctx.translate(0.5, 0.5);

        // filling text
        x = this.cellWidth / 2;
        y = this.cellHeight / 2 + 1;
        this.ctx.textAlign = "center";
        let charWidth = this.ctx.measureText("W").width;
        for (let r = 0; r < this.rowNumber; r++) {
            x = this.cellWidth / 2;
            for (let c = 0; c < this.colNumber; c++) {
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

        // this._canva.addEventListener('click', (e) => {
        //     this.rowColHandler(e.clientX, e.clientY);
        // });

        this.cellHeight = cellHeight;
        this.cellWidth = cellWidth;
        this.rowNumber = rowNumber;
        this.colNumber = colNumber;
        // this.canvaHeight = this.cellHeight * this.rowNumber + 1;
        // this.canvaWidth = this.cellWidth * this.colNumber + 1;

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



// class to manager the Canvas class



class CanvasManager {

    constructor() {

        // row Label width
        this.rowLabelCanvaW = 50;

        // col label height
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
        this.verDxForSmthScroll = 400;

        // horizontal delta change for smooth scroll
        this.horDxForSmthScroll = 400;

        // canvas vertical lower bound
        this.cnvRowLwrBnd = 0;

        // canvas vertical upper bound
        this.cnvRowUprBnd = 0;

        // canvas horizontal upper bound
        this.cnvColLwrBnd = 0;

        // canvas horizontal upper bound
        this.cnvColUprBnd = 0;

        this._render = true;

        this.rowM = new RCManager(this.rows, this.cellHeight, this.rowsPerCanva);
        this.colM = new RCManager(this.cols, this.cellWidth, this.colsPerCanva);

        this._isInstantRenderRequire = true;
    }

    removeRow(r, isLabel = true) {
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

        if (isLabel) {
            this.removeRowLabel(r);
        }
    }

    removeCol(c, isLabel = true) {
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

        if (isLabel) {
            this.removeColLabel(c);
        }
    }

    appendCol(c, isLabel = true) {
        // console.log(`append col of ${c}`)
        if (c < 0 || c >= this.totalCanvaHor) {
            return;
        }
        let col = c;
        let row = this.cnvRowLwrBnd;
        let left = this.colM.cnvdM.getPrefVal(col);
        let top = this.rowM.cnvdM.getPrefVal(row);
        for (; row <= this.cnvRowUprBnd; row++) {
            const pstElm = document.getElementById(row + "_" + col);
            if (pstElm || row < 0 || row >= this.totalCanvaVer) {
                continue;
            }
            top = this.rowM.cnvdM.getPrefVal(row);
            
            // creating the instance of the canva
            let elm = this.cnvInstCreater( row, col );
            this.canvaMagnagerElm.append(elm._canva);
            elm._initialize(this.cellHeight, this.cellWidth, this.rowsPerCanva, this.colsPerCanva);
        }


        if (isLabel) {
            this.appendColLabel(c);
        }
    }

    appendRow(r, isLabel = true) {
        const tmpRow = r;
        // console.log(`append row of ${r}`)
        if (r == 2) {
            console.log()
        }
        if (r < 0 || r >= this.totalCanvaVer) {
            return;
        }


        let row = r;
        let col = this.cnvColLwrBnd;
        // let left = col * this.canvaW;
        let left = this.colM.cnvdM.getPrefVal(col);
        let top = this.rowM.cnvdM.getPrefVal(row);
        for (; col <= this.cnvColUprBnd; col++) {
            const pstElm = document.getElementById(row + "_" + col);
            if (pstElm || col < 0 || col >= this.totalCanvaHor) {
                continue;
            }
            left = this.colM.cnvdM.getPrefVal(col);
            let dt = new DataStorage();

            // creating canva instance and initilizing it

            let elm = this.cnvInstCreater( row, col );
            
            elm._initialize(this.cellHeight, this.cellWidth, this.rowsPerCanva, this.colsPerCanva);
        }

        if (isLabel) {
            this.appendRowLabel(r);
        }
    }

    appendRowLabel(r) {
        if (document.getElementById("R" + r)) { return }
        let labelElm = new RowLabelCanva();
        this.canvaMagnagerElm.append(labelElm._canvaElm);
        labelElm._canvaElm.id = "R" + r;
        labelElm._canvaElm.style.left = this.scrollLeft + "px";
        labelElm._canvaElm.style.top = r * this.canvaH + this.colLabelCanvaH + "px";
        labelElm.initialize(this.rowsPerCanva, this.canvaH, this.rowLabelCanvaW, r * this.rowsPerCanva);
    }

    appendColLabel(c) {
        if (document.getElementById("C" + c)) { return }
        let labelElm = new ColLabelCanva();
        this.canvaMagnagerElm.append(labelElm._canvaElm);
        labelElm._canvaElm.id = "C" + c;
        labelElm._canvaElm.style.top = this.scrollTop + "px";
        labelElm._canvaElm.style.left = c * this.canvaW + this.rowLabelCanvaW + "px";
        labelElm.initialize(this.colsPerCanva, this.colLabelCanvaH, this.canvaW, c * this.colsPerCanva)
    }

    removeRowLabel(r) {
        let elm = document.getElementById("R" + r);
        this.canvaMagnagerElm.removeChild(elm);
    }

    removeColLabel(c) {
        let elm = document.getElementById("C" + c);
        this.canvaMagnagerElm.removeChild(elm);
    }

    updateRowLabelPos() {
        if (!this._render) {
            this.clearChilds();
            return;
        }
        let i = 0;
        for (i = this.cnvRowLwrBnd; i <= this.cnvRowUprBnd; i++) {
            let elm = document.getElementById("R" + i);
            if (!elm) { continue }
            elm.style.left = this.scrollLeft + "px";
        }
    }

    updateColLabelPos() {
        if (!this._render) {
            this.clearChilds();
            return;
        }
        let i = 0;
        for (i = this.cnvColLwrBnd; i <= this.cnvColUprBnd; i++) {
            let elm = document.getElementById("C" + i);
            if (!elm) { continue }
            elm.style.top = this.scrollTop + "px";
        }
    }

    clearChilds() {
        this.canvaMagnagerElm.innerHTML = "";
    }

    cnvInstCreater( row , col ) {
        let inst = new Canva();
        this.canvaMagnagerElm.append(inst._canva);
        inst.masterWobj = this.colM;
        inst.masterHobj = this.rowM;
        inst.canvaHeight = this.rowM.cnvdM.getValue( row );
        inst.canvaWidth = this.colM.cnvdM.getValue( col );
        inst._canva.style.top = this.rowM.cnvdM.getPrefVal( row ) + this.colLabelCanvaH + "px";
        inst._canva.style.left = this.colM.cnvdM.getPrefVal( col ) + this.rowLabelCanvaW +  "px";
        inst._canva.id = row + "_" + col;
        inst._dataStg = new DataStorage();

        return inst;
    }

    // flage 1 ---- > row render
    // flage 0 ---- > col render
    // flage 2 ---- > both need to be rerender

    instantScrollRender(flage) {
        if (!this._render || !this._isInstantRenderRequire) { return }
        const scrollLeft = Math.trunc(this.scrollLeft);
        let j;
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

        for (j = this.cnvColLwrBnd; j <= this.cnvColUprBnd; j++) {
            if (flage == 0 || flage == 2) {
                this.appendCol(j, true);
                this.appendCol(j, true);
            }
        }
        for (j = this.cnvRowLwrBnd; j <= this.cnvRowUprBnd; j++) {
            if (flage == 1 || flage == 2) {
                this.appendRow(j, true);
                this.appendRow(j, true);
            }
        }
        this._isInstantRenderRequire = false;
    }

    smoothScrollRender(isVerticalMove) {
        if (!this._render) {
            this.clearChilds();
            return;
        }
        if (!isVerticalMove) {
            const scrollLeft = Math.trunc(this.scrollLeft);
            let horInd = Math.trunc(scrollLeft / this.canvaW);

            // For Horizontal
            if (horInd >= 1) {
                console.log();
            }
            if ((horInd + this.canvasHorizontal + this.extraCanva) > this.cnvColUprBnd + 1) {
                this.removeCol(this.cnvColLwrBnd, true);
                this.cnvColUprBnd = horInd + this.canvasHorizontal + this.extraCanva - 1;
                this.cnvColLwrBnd = horInd - this.extraCanva;
                this.appendCol(this.cnvColUprBnd, true);
            }
            else if (horInd - this.extraCanva < this.cnvColLwrBnd) {
                this.removeCol(this.cnvColUprBnd);
                this.cnvColUprBnd = horInd + this.canvasHorizontal + this.extraCanva - 1;;
                this.cnvColLwrBnd = horInd - this.extraCanva;
                this.appendCol(this.cnvColLwrBnd);
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
                this.appendRow(this.cnvRowUprBnd);
            }
            else if (verInd - this.extraCanva < this.cnvRowLwrBnd) {
                this.removeRow(this.cnvRowUprBnd);
                this.cnvRowUprBnd = verInd + this.canvasVertical + this.extraCanva - 1;
                this.cnvRowLwrBnd = verInd - this.extraCanva;
                this.appendRow(this.cnvRowLwrBnd);
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


            if (dx > 900) {
                console.log();
            }
            if (dx > 0) {
                this.updateRowLabelPos();
            }

            if (dy > 0) {
                this.updateColLabelPos();
            }


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
            this.updateRowLabelPos();
            this.updateColLabelPos();
        })
        this.canvaMagnagerElm.style.height = this.height + "px";
        this.canvaMagnagerElm.style.width = this.width + "px";
        this.instantScrollRender(2);
    }
}


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

function getNextColumnLabel(colLabel) {
    let carry = 1;
    let result = '';

    // Process characters from end to start
    for (let i = colLabel.length - 1; i >= 0; i--) {
        const charCode = colLabel.charCodeAt(i) - 65; // 'A' is 65
        const sum = charCode + carry;

        if (sum === 26) {
            result = 'A' + result;
            carry = 1;
        } else {
            result = String.fromCharCode(65 + sum) + result;
            carry = 0;
        }
    }

    // If carry is left after processing all chars, add an 'A' at front
    if (carry === 1) {
        result = 'A' + result;
    }

    return result;
}




const canvaM = new CanvasManager;

canvaM.initialize();
// const dt = DataStorage();
// const canva = new Canva();

// canva._dataStg = dt;

// canva._initialize();
// canva.render();

// canva.render();
























