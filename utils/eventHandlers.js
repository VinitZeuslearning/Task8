export default class Selectors {
    constructor(parentContainer, canvaInstant) {
        this.parent = parentContainer;
        this.canvaInstant = canvaInstant;
        this.isSelecting = false;


        this.masterHobj = null;
        this.masterWobj = null;

        this.selectionObj = {
            startRow: 0,
            startCol: 0,
            endRow: 0,
            endCol: 0
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

        this.inputElem.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                this.commitInputValue();
                this.inputElem.style.display = 'none';
            }
        });

    }

    getRelativePos(e) {
        const rect = this.parent.getBoundingClientRect();
        return {
            x: e.clientX + this.parent.scrollLeft - rect.left,
            y: e.clientY + this.parent.scrollTop - rect.top
        };
    }

    handleMouseDown(e) {
        this.isSelecting = true;

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



    handleMouseMove(e) {
        if (!this.isSelecting) return;

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
    }
}
