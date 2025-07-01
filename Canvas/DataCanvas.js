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
        this.fontSize = 12;
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
        this.inputElmObj = null;

        this.rowIndexStartFrm = this.canvaRowIndex * this.rowNumber;
        this.colIndexStartFrm = this.canvaColIndex * this.colNumber;

        this.cellDataObj = null;

        this.selectionObj = {
            Draw: true,
            startRow: 1,
            startCol: 2,
            endRow: 40,
            endCol: 4,
        };



    }

    adjustCanvasDPI() {
        const dpr = window.devicePixelRatio;
        const cssWidth = this._canva.clientWidth;
        const cssHeight = this._canva.clientHeight;

        // Set the internal pixel size of the canvas
        this._canva.width = Math.floor(cssWidth * dpr);
        this._canva.height = Math.floor(cssHeight * dpr);

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
        // Reset transform
        // this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        console.log(`render is happen for x: ${this.canvaRowIndex} y : ${this.canvaColIndex}`)
        // Clear canvas
        this.ctx.clearRect(0, 0, this._canva.width, this._canva.height);

        // Update canvas size
        this.canvaHeight = this.masterHobj.cnvdM.getValue(this.canvaRowIndex);
        this.canvaWidth = this.masterWobj.cnvdM.getValue(this.canvaColIndex);
        this._canva.style.height = this.canvaHeight + "px";
        this._canva.style.width = this.canvaWidth + "px";

        // Adjust for device pixel ratio
        this.adjustCanvasDPI();

        let height = this.canvaHeight;
        let width = this.canvaWidth;

        this.ctx.lineWidth = 1;

        // Pixel-perfect align strokes
        // this.ctx.translate(0.5, 0.5);

        // Draw horizontal grid lines
        let y = 0;
        let ind;
        this.ctx.font = `${this.fontSize}px Arial, sans-serif`;
        let Pos = this.rowNumber * this.canvaRowIndex;
        this.ctx.strokeStyle = "#ccc";
        for (ind = 0; ind < this.rowNumber; ind++) {
            y = Math.round(y);  // Snap to integer

            this.ctx.beginPath();
            this.ctx.moveTo(0, y + 0.5);
            this.ctx.lineTo(width, y + 0.5);
            this.ctx.stroke();

            y += this.masterHobj.getValue(Pos);
            Pos++;
        }

        // Draw vertical grid lines
        let x = 0;
        Pos = this.colNumber * this.canvaColIndex;

        for (ind = 0; ind < this.colNumber; ind++) {
            x = Math.round(x);  // Snap to integer

            this.ctx.beginPath();
            this.ctx.moveTo(x + 0.5, 0);
            this.ctx.lineTo(x + 0.5, height);
            this.ctx.stroke();

            x += this.masterWobj.getValue(Pos);
            Pos++;
        }

        // Draw text cells

        // Draw text cells

        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
        let charWidth = this.ctx.measureText("W").width;

        // Precompute cell top positions inside the canvas (starting from 0)
        let rowYs = [];
        let yPos = 0;
        for (let r = 0; r < this.rowNumber; r++) {
            rowYs.push(yPos);
            yPos += this.masterHobj.getValue(this.rowIndexStartFrm + r);
        }

        // Draw text
        for (let r = 0; r < this.rowNumber; r++) {
            let cellTopY = rowYs[r];
            let cellH = this.masterHobj.getValue(this.rowIndexStartFrm + r);

            let cellX = 0; // Start X at 0 within canvas
            for (let c = 0; c < this.colNumber; c++) {
                let cellW = this.masterWobj.getValue(this.colIndexStartFrm + c);

                let tmp = this.cellDataObj.get(this.rowIndexStartFrm + r, this.colIndexStartFrm + c);
                let maxChars = Math.floor(cellW / charWidth) - 2;
                tmp = tmp.slice(0, Math.max(0, maxChars));

                let textX = cellX + cellW / 2;
                let textY = cellTopY + cellH / 2;

                this.ctx.fillText(tmp, textX, textY);

                cellX += cellW;
            }
        }



        // Selection Code 



        // Draw selection rectangle if active
        if (this.selectionObj.Draw) {
            const { startRow, startCol, endRow, endCol } = this.selectionObj;

            const visStartRow = this.rowIndexStartFrm;
            const visEndRow = visStartRow + this.rowNumber - 1;
            const visStartCol = this.colIndexStartFrm;
            const visEndCol = visStartCol + this.colNumber - 1;

            if (
                endRow >= visStartRow && startRow <= visEndRow &&
                endCol >= visStartCol && startCol <= visEndCol
            ) {
                let selectionLeft = 0, selectionTop = 0, selectionRight = 0, selectionBottom = 0;

                for (let r = visStartRow; r < Math.min(startRow, visEndRow + 1); r++) {
                    selectionTop += this.masterHobj.getValue(r);
                }
                selectionBottom = selectionTop;
                for (let r = Math.max(startRow, visStartRow); r <= Math.min(endRow, visEndRow); r++) {
                    selectionBottom += this.masterHobj.getValue(r);
                }

                for (let c = visStartCol; c < Math.min(startCol, visEndCol + 1); c++) {
                    selectionLeft += this.masterWobj.getValue(c);
                }
                selectionRight = selectionLeft;
                for (let c = Math.max(startCol, visStartCol); c <= Math.min(endCol, visEndCol); c++) {
                    selectionRight += this.masterWobj.getValue(c);
                }

                const width = selectionRight - selectionLeft;
                const height = selectionBottom - selectionTop;

                // Fill selection background
                this.ctx.fillStyle = "rgba(0, 120, 215, 0.2)";
                this.ctx.fillRect(selectionLeft, selectionTop, width, height);

                // Set border styles
                this.ctx.strokeStyle = "rgba(0, 120, 215, 0.8)";
                this.ctx.lineWidth = 2;

                // Draw borders conditionally based on selection's position relative to this canvas's bounds
                this.ctx.beginPath();

                if (startRow <= visEndRow && startRow >= visStartRow) {
                    // top border
                    this.ctx.moveTo(selectionLeft, selectionTop);
                    this.ctx.lineTo(selectionRight, selectionTop);
                }
                if (endCol <= visEndCol && endCol >= visStartCol) {
                    // right border
                    this.ctx.moveTo(selectionRight, selectionTop);
                    this.ctx.lineTo(selectionRight, selectionBottom);
                }
                if (endRow <= visEndRow && endRow >= visStartRow) {
                    // bottom border
                    this.ctx.moveTo(selectionRight, selectionBottom);
                    this.ctx.lineTo(selectionLeft, selectionBottom);
                }
                if (startCol <= visEndCol && startCol >= visStartCol) {
                    // left border
                    this.ctx.moveTo(selectionLeft, selectionBottom);
                    this.ctx.lineTo(selectionLeft, selectionTop);
                }

                this.ctx.stroke();
            }
        }



    }

    findCell(x, y) {
        let tmpY = this.rowIndexStartFrm;
        let tmpX = this.colIndexStartFrm;

        // Starting position of this canvas
        let posY = this.masterHobj.cnvdM.getPrefVal(this.canvaRowIndex);
        let posX = this.masterWobj.cnvdM.getPrefVal(this.canvaColIndex);

        let currentY = posY;
        let currentX = posX;

        let cellTop = -1;
        let cellLeft = -1;

        // Find row index and top position
        for (; tmpY < this.rowNumber + this.rowIndexStartFrm; tmpY++) {
            let cellHeight = this.masterHobj.getValue(tmpY);
            if (y >= currentY && y < currentY + cellHeight) {
                cellTop = currentY;
                break;
            }
            currentY += cellHeight;
        }

        // If not found — exit early
        if (tmpY >= this.rowNumber + this.rowIndexStartFrm) return null;

        // Find col index and left position
        for (; tmpX < this.colNumber + this.colIndexStartFrm; tmpX++) {
            let cellWidth = this.masterWobj.getValue(tmpX);
            if (x >= currentX && x < currentX + cellWidth) {
                cellLeft = currentX;
                break;
            }
            currentX += cellWidth;
        }

        // If not found — exit early
        if (tmpX >= this.colNumber + this.colIndexStartFrm) return null;

        // Now both row & col are valid — set into inputElmObj
        // if ( this.inputElmObj.canvaRowInd == this.canvaRowIndex && this.inputElmObj.canvaColInd == this.canvaColIndex && this.inputElmObj.isCellValueChanged ) {
        //     this.cellDataObj.set( this.inputElmObj.cellRow, this.inputElmObj.cellCol, this.inputElmObj._inpElm.value );
        //     this.render();
        // }
        this.inputElmObj.beforeRenderHandler();
        this.inputElmObj
        this.inputElmObj.posX = cellLeft;
        this.inputElmObj.posY = cellTop;
        this.inputElmObj.canvaColInd = this.canvaColIndex;
        this.inputElmObj.canvaRowInd = this.canvaRowIndex;
        this.inputElmObj.cellRow = tmpY;
        this.inputElmObj.cellCol = tmpX;
        this.inputElmObj.render({ posX: cellLeft, posY: cellTop });
    }



    setInputPos(obj) {
        if (!obj) return; // defensive check if click outside grid region
        this.inpElm.style.top = obj.top + "px";
        this.inpElm.style.left = obj.left - 2 + "px";
        this.inpElm.style.height = this.masterHobj.getValue(obj.row) + "px";
        this.inpElm.style.width = this.masterWobj.getValue(obj.col) + "px";
    }


    changeVal(r, c, val) {
        // Value-changing logic here
    }

    _initialize(cellHeight = 20, cellWidth = 100, rowNumber = 0, colNumber = 0) {

        this._canva.addEventListener('click', (e) => {
            const container = document.getElementById("canvaManager");
            const rect = container.getBoundingClientRect();

            const relativeX = e.clientX + container.scrollLeft - rect.left;
            const relativeY = e.clientY + container.scrollTop - rect.top;

            this.findCell(relativeX, relativeY);
        });


        this.cellHeight = cellHeight;
        this.cellWidth = cellWidth;
        this.rowNumber = rowNumber;
        this.colNumber = colNumber;

        this.rowIndexStartFrm = this.canvaRowIndex * this.rowNumber;
        this.colIndexStartFrm = this.canvaColIndex * this.colNumber;

        this.render();
    }
}