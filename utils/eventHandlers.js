export default class Selectors {
    constructor(parentContainer, canvaInstant) {
        this.parent = parentContainer;
        this.canvaInstant = canvaInstant;
        this.rowLableInstant = null;
        this.colLableInstant = null;
        this.isSelecting = false;
        this.resizingHandler = null;


        this.masterHobj = null;
        this.masterWobj = null;

        this.selectionObj = {
            startRow: 0,
            startCol: 0,
            endRow: 0,
            endCol: 0
        };

        this.state = {
            resizing: false,
            resizeType: null,    // 'row' | 'col'
            colLabel: null,
            rowLabel: null,
            colNumber: null,
            rowNumber: null,
            startX: 0,
            startY: 0
        }
        this.interactionContext = {
            mode: null,         // 'select' | 'resize-col' | 'resize-row'
            startX: 0,
            startY: 0,
            colLabel: null,
            rowLabel: null,
            colNumber: null,
            rowNumber: null
        };



        this.prevStartCanvaRow = null;
        this.prevEndCanvaRow = null;
        this.prevStartCanvaCol = null;
        this.prevEndCanvaCol = null;
        this.cellDataObj = null;

        this.createInputElement();
        // this.attachListeners();
    }

    attachListeners() {
        this.parent.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.parent.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.parent.addEventListener("mouseup", this.handleMouseUp.bind(this));
    }

    getRelativePos(e) {
        const rect = this.parent.getBoundingClientRect();
        return {
            x: e.clientX + this.parent.scrollLeft - rect.left,
            y: e.clientY + this.parent.scrollTop - rect.top
        };
    }

    createInputElement() {
        this.inputElem = document.createElement('input');
        this.inputElem.type = 'text';
        this.inputElem.style.position = 'absolute';
        // this.inputElem.style.display = 'none';
        this.inputElem.style.border = '1px solid #0078d7';
        // this.inputElem.style.outline = 'none';
        this.inputElem.style.fontSize = '14px';
        this.inputElem.style.boxSizing = 'border-box';
        this.inputElem.style.zIndex = 1000;

        this.inputElem.id = "newInputElm"

        this.parent.appendChild(this.inputElem);

        // this.inputElem.addEventListener('blur', () => {
        //     this.commitInputValue();
        //     this.inputElem.style.display = 'none';
        // });

        this.inputElem.style.height = 0 + "px"
        this.inputElem.style.width = 0 + "px"

        this.inputElem.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                this.commitInputValue();
                this.inputElem.style.display = 'none';
            }
        });

    }

    repositionActiveInput() {
        // If no active input, skip
        if (this.activeInputRow === undefined || this.activeInputCol === undefined) return;

        const row = this.activeInputRow;
        const col = this.activeInputCol;

        // Get the canvas this cell lives in
        const canvaRow = Math.floor(row / 20);
        const canvaCol = Math.floor(col /8);

        // Compute new top position by adding up heights of rows before `row`
        let top = this.masterHobj.cnvdM.getPrefVal( canvaRow );
        for (let r = 0; r < row; r++) {
            top += this.masterHobj.getValue(r);
        }

        // Compute new left position by adding up widths of cols before `col`
        let left = this.masterWobj.cnvdM.getPrefVal( canvaCol );
        for (let c = 0; c < col; c++) {
            left += this.masterWobj.getValue(c);
        }

        // Set new position and size for input element
        this.inputElem.style.top = `${top}px`;
        this.inputElem.style.left = `${left}px`;
        this.inputElem.style.width = `${this.masterWobj.getValue(col)}px`;
        this.inputElem.style.height = `${this.masterHobj.getValue(row)}px`;
    }


    getRelativePos(e) {
        const rect = this.parent.getBoundingClientRect();
        return {
            x: e.clientX + this.parent.scrollLeft - rect.left,
            y: e.clientY + this.parent.scrollTop - rect.top
        };
    }

    handleMouseDown(e) {
        const type = e.target.getAttribute('type');

        if (type === 'cell') {
            this.isSelecting = true;
            this.interactionContext.mode = 'select';
            this.cellSelection(e);
            return;
        }

        if (type === 'ColLabel') {
            const colLabel = this.colLableInstant.get(Number(e.target.getAttribute('column')));
            const x = e.clientX;
            const y = e.clientY;

            const onLine = colLabel.isOnLine(x, y);
            if (onLine !== -1) {
                this.interactionContext.mode = 'resize-col';
                this.interactionContext.startX = e.clientX;
                this.interactionContext.colLabel = colLabel;
                this.interactionContext.colNumber = onLine - 1;
            }
        }

        if (type === 'RowLabel') {
            const rowLabel = this.rowLableInstant.get(Number(e.target.getAttribute('row')));
            const x = e.clientX;
            const y = e.clientY;

            const onLine = rowLabel.isOnLine(x, y);
            if (onLine !== -1) {
                this.interactionContext.mode = 'resize-row';
                this.interactionContext.startY = e.clientY;
                this.interactionContext.rowLabel = rowLabel;
                this.interactionContext.rowNumber = onLine - 1;
            }
        }
    }


    handleMouseMove(e) {
        const ctx = this.interactionContext;
        const type = e.target.getAttribute('type');

        // If resizing is happening — handle it unconditionally
        if (ctx.mode === 'resize-row') {
            document.body.style.cursor = 'row-resize';
            const dy = Math.floor(e.clientY - ctx.startY);
            this.resizingHandler({
                canvaRow: ctx.rowLabel.canvaRowNumber,
                extra: dy,
                rowNumber: ctx.rowNumber
            });
            ctx.startY = e.clientY;

            // Only resize input if it's on this row
            if (this.activeInputRow === ctx.rowNumber) {
                this.inputElem.style.height = this.masterHobj.getValue(ctx.rowNumber) + "px";
            }

            // Reposition input if necessary
            this.repositionActiveInput();

            return;
        }


        if (ctx.mode === 'resize-col') {
            document.body.style.cursor = 'col-resize';
            const dx = Math.floor(e.clientX - ctx.startX);
            this.resizingHandler({
                canvaCol: ctx.colLabel.canvaColNumber,
                extra: dx,
                colNumber: ctx.colNumber
            });
            ctx.startX = e.clientX;

            // Only resize input if it's on this col
            if (this.activeInputCol === ctx.colNumber) {
                this.inputElem.style.width = this.masterWobj.getValue(ctx.colNumber) + "px";
            }

            // Reposition input if necessary
            this.repositionActiveInput();

            return;
        }



        // ROW LABEL HOVER DETECTION
        if (type === "RowLabel") {
            const rowNum = Number(e.target.getAttribute('row'));
            const rowLabel = this.rowLableInstant.get(rowNum);
            const isOnLine = rowLabel.isOnLine(e.clientX, e.clientY);

            if (isOnLine !== -1) {
                document.body.style.cursor = 'row-resize';
            } else {
                document.body.style.cursor = 'default';
            }
            return;
        }

        // COL LABEL HOVER DETECTION
        if (type === "ColLabel") {
            const colNum = Number(e.target.getAttribute('column'));
            const colLabel = this.colLableInstant.get(colNum);
            const isOnLine = colLabel.isOnLine(e.clientX, e.clientY);

            if (isOnLine !== -1) {
                document.body.style.cursor = 'col-resize';
            } else {
                document.body.style.cursor = 'default';
            }
            return;
        }

        // CELL SELECTION MOVEMENT
        if (ctx.mode === 'select' && type === 'cell') {
            this.cellSelectionMouseMove(e);
            return;
        }

        // Fallback: default cursor when not over labels or cells
        if (ctx.mode === null) {
            document.body.style.cursor = 'default';
        }
    }



    cellSelection(e) {
        const canvaRow = Number(e.target.getAttribute('row'));
        const canvaCol = Number(e.target.getAttribute('column'));
        const cnvInst = this.canvaInstant.get(canvaRow, canvaCol);
        if (!cnvInst) return;

        const pos = this.getRelativePos(e);
        const cellData = cnvInst.findCell(pos.x, pos.y);
        if (!cellData) return;

        const { posX, posY, row, col } = cellData;
        const rowNumPerCanvas = cnvInst.rowNumber;
        const colNumPerCanvas = cnvInst.colNumber;

        // If inputElem is active — save its current value to cellDataObj before moving
        if (this.inputElem.style.display === 'block') {
            const prevRow = this.activeInputRow;
            const prevCol = this.activeInputCol;
            const prevValue = this.inputElem.value;

            if (prevRow !== undefined && prevCol !== undefined) {
                const existingValue = this.cellDataObj.get(prevRow, prevCol);
                if (prevValue !== existingValue) {
                    this.cellDataObj.set(prevRow, prevCol, prevValue);
                }
            }
        }

        this.selectionObj.startRow = this.selectionObj.endRow = row;
        this.selectionObj.startCol = this.selectionObj.endCol = col;

        // Clear previous selection area
        if (
            this.prevStartCanvaRow !== null &&
            this.prevEndCanvaRow !== null &&
            this.prevStartCanvaCol !== null &&
            this.prevEndCanvaCol !== null
        ) {
            for (let r = this.prevStartCanvaRow; r <= this.prevEndCanvaRow; r++) {
                for (let c = this.prevStartCanvaCol; c <= this.prevEndCanvaCol; c++) {
                    const instance = this.canvaInstant.get(r, c);
                    if (instance) instance.render();
                }
            }
        }

        // Update previous canvas range
        const canvasRow = Math.floor(row / rowNumPerCanvas);
        const canvasCol = Math.floor(col / colNumPerCanvas);

        this.prevStartCanvaRow = this.prevEndCanvaRow = canvasRow;
        this.prevStartCanvaCol = this.prevEndCanvaCol = canvasCol;

        cnvInst.render();

        // Position and show inputElem using findCell result
        this.inputElem.style.left = `${posX}px`;
        this.inputElem.style.top = `${posY}px`;
        this.inputElem.style.width = `${cnvInst.masterWobj.getValue(col)}px`;
        this.inputElem.style.height = `${cnvInst.masterHobj.getValue(row)}px`;

        // why removing this text is not get save 
        this.inputElem.style.display = 'block';

        // Load value into input
        this.inputElem.value = this.cellDataObj.get(row, col) || '';

        // Track active input cell
        this.activeInputRow = row;
        this.activeInputCol = col;

        this.inputElem.focus();
        this.inputElem.select();
    }

    commitInputValue() {
        if (this.inputElem.style.display === 'block') {
            const row = this.activeInputRow;
            const col = this.activeInputCol;
            if (row !== undefined && col !== undefined) {
                const value = this.inputElem.value;
                const existingValue = this.cellDataObj.get(row, col);
                if (value !== existingValue) {
                    this.cellDataObj.set(row, col, value);
                }
            }
        }
    }

    cellSelectionMouseMove(e) {
        const canvaRow = Number(e.target.getAttribute('row'));
        const canvaCol = Number(e.target.getAttribute('column'));
        const cnvInst = this.canvaInstant.get(canvaRow, canvaCol);
        if (!cnvInst) return;

        const pos = this.getRelativePos(e);
        const cell = cnvInst.getCellAtPosition(pos.x, pos.y);
        if (!cell) return;

        this.selectionObj.endRow = cell.row;
        this.selectionObj.endCol = cell.col;

        const rowNumPerCanvas = cnvInst.rowNumber;
        const colNumPerCanvas = cnvInst.colNumber;

        const currStartCanvaRow = Math.floor(Math.min(this.selectionObj.startRow, this.selectionObj.endRow) / rowNumPerCanvas);
        const currEndCanvaRow = Math.floor(Math.max(this.selectionObj.startRow, this.selectionObj.endRow) / rowNumPerCanvas);
        const currStartCanvaCol = Math.floor(Math.min(this.selectionObj.startCol, this.selectionObj.endCol) / colNumPerCanvas);
        const currEndCanvaCol = Math.floor(Math.max(this.selectionObj.startCol, this.selectionObj.endCol) / colNumPerCanvas);

        const minRow = Math.min(currStartCanvaRow, this.prevStartCanvaRow);
        const maxRow = Math.max(currEndCanvaRow, this.prevEndCanvaRow);
        const minCol = Math.min(currStartCanvaCol, this.prevStartCanvaCol);
        const maxCol = Math.max(currEndCanvaCol, this.prevEndCanvaCol);

        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                const instance = this.canvaInstant.get(r, c);
                if (instance) instance.render();
            }
        }

        this.prevStartCanvaRow = currStartCanvaRow;
        this.prevEndCanvaRow = currEndCanvaRow;
        this.prevStartCanvaCol = currStartCanvaCol;
        this.prevEndCanvaCol = currEndCanvaCol;
    }




    handleMouseUp() {
        this.isSelecting = false;
        document.body.style.cursor = 'default';
        this.interactionContext = {
            mode: null,
            startX: 0,
            startY: 0,
            colLabel: null,
            rowLabel: null,
            colNumber: null,
            rowNumber: null
        };
    }


}
