import adjustCanvasDPI from "../utils/adjustDpi.js";
/**
 * Represents a canvas block responsible for rendering a section of a virtualized grid.
 * 
 * Each `Canva` instance corresponds to one visible portion (or tile) of the overall grid,
 * handling its own rendering, DPI scaling, and selection highlighting.
 */
export default class Canva {
    /**
   * Creates a new Canva instance.
   * Initializes internal properties and canvas element.
   *
   * @constructor
   */
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

        this.rowIndexStartFrm = this.canvaRowIndex * this.rowNumber;
        this.colIndexStartFrm = this.canvaColIndex * this.colNumber;

        this.cellDataObj = null;

        this.selectionObj = null



    }


    /**
     * Adjusts the canvas's internal resolution based on the device pixel ratio (DPR)
     * for sharp rendering on high-DPI displays.
     */
    adjustCanvasDPI() {
        adjustCanvasDPI(this._canva, this.ctx)
        // const dpr = window.devicePixelRatio || 1;
        // const cssWidth = this._canva.clientWidth;
        // const cssHeight = this._canva.clientHeight;

        // // Set the internal pixel size of the canvas
        // this._canva.width = Math.round(cssWidth * dpr);
        // this._canva.height = Math.round(cssHeight * dpr);

        // // Set the CSS size so it stays visually the same size on screen
        // this._canva.style.width = `${cssWidth}px`;
        // this._canva.style.height = `${cssHeight}px`;

        // // this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        // this.ctx.scale(dpr, dpr);
    }

    /**
     * Renders the canvas: grid lines, cell text, and selection highlights.
     */
    render() {
        // Reset transform
        // this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        // console.log(`render is happen for x: ${this.canvaRowIndex} y : ${this.canvaColIndex}`)
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
        let charWidth = this.ctx.measureText("w").width;

        // Precompute cell top positions inside the canvas (starting from 0)
        let rowYs = [];
        let yPos = 0;
        for (let r = 0; r < this.rowNumber; r++) {
            rowYs.push(yPos);
            yPos += this.masterHobj.getValue(this.rowIndexStartFrm + r);
        }

        // Draw text
        let cellTopY = 0;
        for (let r = 0; r < this.rowNumber; r++) {
            let cellH = this.masterHobj.getValue(this.rowIndexStartFrm + r);

            let cellX = 0;
            for (let c = 0; c < this.colNumber; c++) {
                let cellW = this.masterWobj.getValue(this.colIndexStartFrm + c);

                let tmp = this.cellDataObj.get(this.rowIndexStartFrm + r, this.colIndexStartFrm + c);
                // let maxChars = Math.floor(cellW / charWidth);
                tmp = tmp.slice(0, Math.max(0, 14));

                let textX = cellX + cellW / 2;
                let textY = cellTopY + cellH / 2;

                this.ctx.fillText(tmp, textX, textY);

                cellX += cellW;
            }

            cellTopY += cellH;
        }

        // this.repositioning();



        // Selection Code 



        // Draw selection rectangle if active
        // Draw selection rectangle if active
        const { startRow, startCol, endRow, endCol } = this.selectionObj;

        const visStartRow = this.rowIndexStartFrm;
        const visEndRow = visStartRow + this.rowNumber - 1;
        const visStartCol = this.colIndexStartFrm;
        const visEndCol = visStartCol + this.colNumber - 1;
        const condition = Math.max(startRow, endRow) < visStartRow || Math.min(startRow, endRow) > visEndRow ||
            Math.max(startCol, endCol) < visStartCol || Math.min(startCol, endCol) > visEndCol;
        // If no overlap with this canvas, skip

        if (!condition) {
            // Normalize selection boundaries
            const selStartRow = Math.min(startRow, endRow);
            const selEndRow = Math.max(startRow, endRow);
            const selStartCol = Math.min(startCol, endCol);
            const selEndCol = Math.max(startCol, endCol);

            // Compute selection top and bottom positions within this canvas
            let selectionTop = 0;
            for (let r = visStartRow; r < Math.min(selStartRow, visEndRow + 1); r++) {
                selectionTop += this.masterHobj.getValue(r);
            }

            let selectionBottom = selectionTop;
            for (let r = Math.max(selStartRow, visStartRow); r <= Math.min(selEndRow, visEndRow); r++) {
                selectionBottom += this.masterHobj.getValue(r);
            }

            // Compute selection left and right positions within this canvas
            let selectionLeft = 0;
            for (let c = visStartCol; c < Math.min(selStartCol, visEndCol + 1); c++) {
                selectionLeft += this.masterWobj.getValue(c);
            }

            let selectionRight = selectionLeft;
            for (let c = Math.max(selStartCol, visStartCol); c <= Math.min(selEndCol, visEndCol); c++) {
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

            // Draw borders
            this.ctx.beginPath();

            // top border
            if (selStartRow <= visEndRow && selStartRow >= visStartRow) {
                this.ctx.moveTo(selectionLeft, selectionTop);
                this.ctx.lineTo(selectionRight, selectionTop);
            }

            // right border
            if (selEndCol <= visEndCol && selEndCol >= visStartCol) {
                this.ctx.moveTo(selectionRight, selectionTop);
                this.ctx.lineTo(selectionRight, selectionBottom);
            }

            // bottom border
            if (selEndRow <= visEndRow && selEndRow >= visStartRow) {
                this.ctx.moveTo(selectionRight, selectionBottom);
                this.ctx.lineTo(selectionLeft, selectionBottom);
            }

            // left border
            if (selStartCol <= visEndCol && selStartCol >= visStartCol) {
                this.ctx.moveTo(selectionLeft, selectionBottom);
                this.ctx.lineTo(selectionLeft, selectionTop);
            }

            this.ctx.stroke();
        }

        this.repositioning()
    }

    /**
    * Repositions the canvas DOM element inside the container
    * based on its row and column index positions.
    */
    repositioning() {
        this._canva.style.left = this.masterWobj.cnvdM.getPrefVal(this.canvaColIndex) + "px"
        this._canva.style.top = this.masterHobj.cnvdM.getPrefVal(this.canvaRowIndex) + "px"
    }

    /**
   * Returns the grid cell indices (row and col) at the given screen-space position (x, y).
   *
   * @param {number} x - The X coordinate (relative to container).
   * @param {number} y - The Y coordinate (relative to container).
   * @returns {{row: number, col: number} | null} The cell indices or null if out of bounds.
   */
    getCellAtPosition(x, y) {
        // Calculate canvas offset within the parent container
        const canvasOffsetY = this.masterHobj.cnvdM.getPrefVal(this.canvaRowIndex);
        const canvasOffsetX = this.masterWobj.cnvdM.getPrefVal(this.canvaColIndex);

        // Convert to canvas-relative positions
        const localX = x - canvasOffsetX;
        const localY = y - canvasOffsetY;

        // Check if click is outside this canvas
        if (localX < 0 || localY < 0 ||
            localX >= this.canvaWidth || localY >= this.canvaHeight) {
            return null;
        }

        // Now scan rows and cols
        let rowIdx = this.rowIndexStartFrm;
        let colIdx = this.colIndexStartFrm;

        let currentY = 0;
        let currentX = 0;

        // Find the row index
        for (; rowIdx < this.rowIndexStartFrm + this.rowNumber; rowIdx++) {
            let h = this.masterHobj.getValue(rowIdx);
            if (localY >= currentY && localY < currentY + h) {
                break;
            }
            currentY += h;
        }
        if (rowIdx >= this.rowIndexStartFrm + this.rowNumber) return null;

        // Find the column index
        for (; colIdx < this.colIndexStartFrm + this.colNumber; colIdx++) {
            let w = this.masterWobj.getValue(colIdx);
            if (localX >= currentX && localX < currentX + w) {
                break;
            }
            currentX += w;
        }
        if (colIdx >= this.colIndexStartFrm + this.colNumber) return null;

        // Return cell indices
        return { row: rowIdx, col: colIdx };
    }

    /**
   * Finds the position and grid indices of the cell at a given screen-space position.
   *
   * @param {number} x - The X coordinate relative to the viewport.
   * @param {number} y - The Y coordinate relative to the viewport.
   * @returns {{posX: number, posY: number, row: number, col: number} | null} 
   *  The position and indices of the cell or null if outside the canvas.
   */
    findCell(x, y) {
        const container = document.getElementById("canvaManager");
        const rect = container.getBoundingClientRect();

        const relativeX = x + container.scrollLeft;
        const relativeY = y + container.scrollTop;

        let tmpY = this.rowIndexStartFrm;
        let tmpX = this.colIndexStartFrm;

        // Starting position of this canvas inside parent
        let canvasPosY = this.masterHobj.cnvdM.getPrefVal(this.canvaRowIndex);
        let canvasPosX = this.masterWobj.cnvdM.getPrefVal(this.canvaColIndex);

        let currentY = canvasPosY;
        let currentX = canvasPosX;

        let cellTop = -1;
        let cellLeft = -1;

        // Find row index and top position
        for (; tmpY < this.rowNumber + this.rowIndexStartFrm; tmpY++) {
            let cellHeight = this.masterHobj.getValue(tmpY);
            if (relativeY >= currentY && relativeY < currentY + cellHeight) {
                cellTop = currentY;
                break;
            }
            currentY += cellHeight;
        }

        if (tmpY >= this.rowNumber + this.rowIndexStartFrm) return null;

        // Find col index and left position
        for (; tmpX < this.colNumber + this.colIndexStartFrm; tmpX++) {
            let cellWidth = this.masterWobj.getValue(tmpX);
            if (relativeX >= currentX && relativeX < currentX + cellWidth) {
                cellLeft = currentX;
                break;
            }
            currentX += cellWidth;
        }

        if (tmpX >= this.colNumber + this.colIndexStartFrm) return null;

        // Update input element position and metadata
        // this.inputElmObj.beforeRenderHandler();
        // this.inputElmObj.posX = cellLeft;
        // this.inputElmObj.posY = cellTop;
        // this.inputElmObj.canvaColInd = this.canvaColIndex;
        // this.inputElmObj.canvaRowInd = this.canvaRowIndex;
        // this.inputElmObj.cellRow = tmpY;
        // this.inputElmObj.cellCol = tmpX;
        // this.inputElmObj.render({ posX: cellLeft, posY: cellTop });

        // Return computed values relative to parent (which cellLeft and cellTop already are)
        return {
            posX: cellLeft,
            posY: cellTop,
            row: tmpY,
            col: tmpX
        };
    }

    /**
     * Initializes the canvas instance with cell sizes, number of rows/columns, 
     * and attaches click event listeners.
     *
     * @param {number} [cellHeight=20] - Default cell height.
     * @param {number} [cellWidth=100] - Default cell width.
     * @param {number} [rowNumber=0] - Number of rows in this canvas section.
     * @param {number} [colNumber=0] - Number of columns in this canvas section.
     */
    _initialize(cellHeight, cellWidth , rowNumber , colNumber) {

        this._canva.setAttribute('row', this.canvaRowIndex)
        this._canva.setAttribute('column', this.canvaColIndex)
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