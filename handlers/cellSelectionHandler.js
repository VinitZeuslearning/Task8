export class CellSelectionHandler {
    constructor(renderCanvaDt, selectionObj, renderInputElm, canvaInstant, parentContainer, inputDataObj, colLabelSelectionObj, rowLabelSelectionObj, renderAll  ) {
        this.cellSelectionObj = selectionObj;
        this.renderCavaDt = renderCanvaDt;
        this.renderInputElm = renderInputElm;
        this.canvaInstant = canvaInstant;
        this.parent = parentContainer;
        this.inputDataObj = inputDataObj;
        this.uniqueId = "cellSelection";

        this.rowLabelSelectionObj = rowLabelSelectionObj;
        this.colLabelSelectionObj = colLabelSelectionObj;

        this.renderAll = renderAll;
        this.isMouseDown = false;
    }

    hitTest(e) {
        const elm  = document.elementFromPoint( e.clientX, e.clientY );

        if ( elm.getAttribute( 'type' ) == "cell" ) {
            return true;
        }
        return false;
    }

    getRelativePos(e) {
        const rect = this.parent.getBoundingClientRect();
        return {
            x: e.clientX + this.parent.scrollLeft - rect.left,
            y: e.clientY + this.parent.scrollTop - rect.top
        };
    }

    clearCellSelection() {
        // Reset main selection object values
        this.cellSelectionObj.startRow = 0;
        this.cellSelectionObj.endRow = 0;
        this.cellSelectionObj.startCol = 0;
        this.cellSelectionObj.endCol = 0;


        this.rowLabelSelectionObj.start = 0
        this.rowLabelSelectionObj.end = 0
        this.colLabelSelectionObj.start = 0
        this.colLabelSelectionObj.end = 0
        // Use your existing rerender method to refresh canvases
        this.renderAll();
    }

    mouseDownHandler(e) {
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

        this.cellSelectionObj.startRow = this.cellSelectionObj.endRow = row;
        this.cellSelectionObj.startCol = this.cellSelectionObj.endCol = col;

        this.rowLabelSelectionObj.start = this.cellSelectionObj.startRow;
        this.rowLabelSelectionObj.end = this.cellSelectionObj.endRow;
        this.colLabelSelectionObj.start = this.cellSelectionObj.startCol
        this.colLabelSelectionObj.end = this.cellSelectionObj.endCol;
        this.renderAll();

        this.inputDataObj.activeInputRow = row;
        this.inputDataObj.activeInputCol = col;
        this.renderInputElm();
        this.isMouseDown = true;
    }

    mouseMoveHandler(e) {
        if ( !this.isMouseDown ) { return }
        const canvaRow = Number(e.target.getAttribute('row'));
        const canvaCol = Number(e.target.getAttribute('column'));
         const cnvInst = this.canvaInstant.get(canvaRow, canvaCol);
        if (!cnvInst) return;

        const pos = this.getRelativePos(e);
        const cell = cnvInst.getCellAtPosition(pos.x, pos.y);
        if (!cell) return;

        this.cellSelectionObj.endRow = cell.row;
        this.cellSelectionObj.endCol = cell.col;

        this.colLabelSelectionObj.end = cell.col;
        this.rowLabelSelectionObj.end = cell.row;

        this.renderAll();
    }

    mouseUpHandler() {
        this.isMouseDown = false
        return;
    }
}