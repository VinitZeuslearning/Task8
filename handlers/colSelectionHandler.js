export class ColSelectionHandler {

    constructor(clearRowLabelSelection, clearCellSelection, renderAll, colLabelSelectionObj, selectionObj, colLableInstant, totalRow, parent, rowLabelSelectionObj, startAutoScroll, mainContainer , autoScrollObj ) {
        this.clearRowLabelSelection = clearRowLabelSelection;
        this.clearCellSelection = clearCellSelection
        this.renderAll = renderAll;
        this.colLabelSelectionObj = colLabelSelectionObj;
        this.selectionObj = selectionObj;
        this.colLableInstant = colLableInstant;
        this.totalRow = totalRow;
        this.parent = parent;
        this.selecting = false;

        this.rowLabelSelectionObj = rowLabelSelectionObj;
        this.startAutoScroll = startAutoScroll;
        this.mainContainer = mainContainer;
        this.autoScroll = autoScrollObj
    }

    hitTest(e) {
        const elm = document.elementFromPoint(e.clientX, e.clientY);

        const inst = this.colLableInstant.get(Number(elm.getAttribute('column')));

        if (!inst) {
            return false;
        }

        const onLine = inst.isOnLine(e.clientX, e.clientY);

        if (elm.getAttribute('type') == 'ColLabel' && onLine == -1) {
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
        const canvaCol = Number(e.target.getAttribute('column'));
        const cnvInst = this.colLableInstant.get(canvaCol);
        if (!cnvInst) return;

        const pos = this.getRelativePos(e);
        const colNumber = cnvInst.findCol(pos.x);
        if (colNumber === -1) return;

        this.colLabelSelectionObj.start = colNumber
        this.colLabelSelectionObj.end = colNumber
        this.selectionObj.startRow = 0;
        this.selectionObj.endRow = this.totalRow;
        this.selectionObj.startCol = colNumber;
        this.selectionObj.endCol = colNumber;
        this.selecting = true;
        this.rowLabelSelectionObj.start = 0;
        this.rowLabelSelectionObj.end = this.totalRow;
        this.renderAll();
    }

    mouseMoveHandler(e) {
        if (!this.selecting) return;

        const elm = document.elementFromPoint(e.clientX, e.clientY);
        const canvaCol = Number(elm.getAttribute('column'));
        const cnvInst = this.colLableInstant.get(canvaCol);
        if (!cnvInst) return;

        const pos = this.getRelativePos(e);
        const colNumber = cnvInst.findCol(pos.x);
        if (colNumber === -1) return;

        this.colLabelSelectionObj.end = colNumber;
        this.selectionObj.endCol = colNumber;
        this.renderAll();

        //  console.log( "mouse move of colselection" )

        this.startAutoScroll( this.selectionOnAutoScroll.bind( this ) )
    }

    selectionOnAutoScroll( x, y ) {
        const elm = document.elementFromPoint( x , y );
        const canvaColNum = Number( elm.getAttribute( 'column' ) );
        const inst  = this.colLableInstant.get(canvaColNum);
        if ( !inst ) {
            return;
        }

        const pos = this.getRelativePos({clientX: x, clientY: y});
        const colNumber = inst.findCol(pos.x);
        this.colLabelSelectionObj.end = colNumber;
        this.selectionObj.endCol = colNumber;
        this.renderAll();
    }
    mouseUpHandler(e) {
        this.selecting = false
    }
}