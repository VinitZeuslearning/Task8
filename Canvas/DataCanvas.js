import adjustCanvasDPI from "../utils/adjustDpi.js";
export default class Canva {
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
        this.canvaRowIndex = null;
        this.canvaColIndex = null;
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

        this.ctx.clearRect(0, 0, this._canva.width, this._canva.height);

        this.canvaHeight = this.masterHobj.cnvdM.getValue( this.canvaRowIndex );
        this.canvaWidth =  this.masterWobj.cnvdM.getValue( this.canvaColIndex );
        this._canva.style.height = this.canvaHeight + "px";
        this._canva.style.width = this.canvaWidth + "px";
        

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

        let Pos = this.rowNumber * this.canvaRowIndex;
        for (ind = 0; ind <= this.rowNumber; ind++) {
            Pos += ind;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
            // y += this.cellHeight;
            y += this.masterHobj.getValue(Pos);
        }

        // Draw vertical grid lines (columns)
        let x = 0;
        
        Pos = this.colNumber * this.canvaRowIndex;

        for (ind = 0; ind <= this.colNumber; ind++) {
            Pos += ind;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
            // x += this.cellWidth;
            x += this.masterWobj.getValue(Pos);
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
   

        let rect = this._canva.getBoundingClientRect();
        this.canvaLeft = rect.left;
        this.canvaRight = rect.right;
        this.canvaTop = rect.top;
        this.canvaBottom = rect.bottom;

        this.render();
    }
}