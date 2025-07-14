export class RowSelectionHandler {

    constructor(clearColLabelSelection, clearCellSelection, renderAll, rowLabelSelectionObj, selectionObj, rowLableInstant, totalCol, parent, colLabelSelectionObj, startAutoScroll, mainContainer, autoScrollObj) {
        this.clearColLabelSelection = clearColLabelSelection;
        this.clearCellSelection = clearCellSelection
        this.renderAll = renderAll;
        this.rowLabelSelectionObj = rowLabelSelectionObj;
        this.selectionObj = selectionObj;
        this.rowLableInstant = rowLableInstant;
        this.totalCol = totalCol;
        this.parent = parent;
        this.selecting = false;
        this.colLabelSelectionObj = colLabelSelectionObj;
        this.startAutoScroll = startAutoScroll;
        this.mainContainer = mainContainer;
        this.autoScroll = autoScrollObj

    }

    hitTest(e) {
        const elm = document.elementFromPoint(e.clientX, e.clientY);

        const inst = this.rowLableInstant.get(Number(elm.getAttribute('row')));

        if (!inst) {
            return false;
        }

        const onLine = inst.isOnLine(e.clientX, e.clientY);

        if (elm.getAttribute('type') == 'RowLabel' && onLine == -1) {
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

    mouseDownHandler(e) {
        const canvaRow = Number(e.target.getAttribute('row'));
        const cnvInst = this.rowLableInstant.get(canvaRow);
        if (!cnvInst) return;

        const pos = this.getRelativePos(e);
        const rowNumber = cnvInst.findRow(pos.y);
        if (rowNumber === -1) return;

        this.rowLabelSelectionObj.start = rowNumber
        this.rowLabelSelectionObj.end = rowNumber
        this.selectionObj.startCol = 0;
        this.selectionObj.endCol = this.totalCol;
        this.selectionObj.startRow = rowNumber;
        this.selectionObj.endRow = rowNumber;
        this.selecting = true;
        this.colLabelSelectionObj.start = 0;
        this.colLabelSelectionObj.end = this.totalCol;
        this.renderAll();
    }

    mouseMoveHandler(e) {
        if (!this.selecting) return;
        this.selectingRow(e.clientX, e.clientY);
        this.startAutoScroll(this.selectionOnAutoScroll.bind( this ));
    }

    selectingRow(x, y) {
        const elm = document.elementFromPoint(x, y);

        const canvaRow = Number(elm.getAttribute('row'));
        if (canvaRow == -1) {
            return;
        }
        const cnvInst = this.rowLableInstant.get(canvaRow);
        if (!cnvInst) return;

        const pos = this.getRelativePos({ clientX: x, clientY: y });
        const rowNumber = cnvInst.findRow(pos.y);
        if (rowNumber === -1) return;

        this.rowLabelSelectionObj.end = rowNumber;
        this.selectionObj.endRow = rowNumber;
        this.renderAll();
    }


    selectionOnAutoScroll(x, y) {
        this.selectingRow( x , y );
    }

    mouseUpHandler(e) {
        this.selecting = false
    }
}