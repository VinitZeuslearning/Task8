export class ColSelectionHandler{

    constructor( clearRowLabelSelection, clearCellSelection, renderAll,colLabelSelectionObj, selectionObj,colLableInstant, totalRow, parent  ) {
        this.clearRowLabelSelection = clearRowLabelSelection;
        this.clearCellSelection = clearCellSelection
        this.renderAll = renderAll;
        this.colLabelSelectionObj = colLabelSelectionObj;
        this.selectionObj = selectionObj;
        this.colLableInstant = colLableInstant;
        this.totalRow = totalRow;
        this.parent = parent;
        this.selecting =false;
    }

    hitTest( e ) {
        const elm = document.elementFromPoint(e.clientX, e.clientY);

        const inst = this.colLableInstant.get( Number(elm.getAttribute( 'column' ) ) );

        if ( !inst ) {
            return false;
        }

        const onLine = inst.isOnLine( e.clientX, e.clientY );

        if ( elm.getAttribute( 'type' ) == 'ColLabel' && onLine == -1 ) {
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

    mouseDownHandler( e ) {
        const canvaCol = Number(e.target.getAttribute('column'));
        const cnvInst = this.colLableInstant.get(canvaCol);
        if (!cnvInst) return;

        const pos = this.getRelativePos(e);
        const colNumber = cnvInst.findCol(pos.x);
        if (colNumber === -1) return;

        this.colLabelSelectionObj.start = colNumber
        this.colLabelSelectionObj.end = colNumber
        this.selectionObj.starRow = 0;
        this.selectionObj.endRow = this.totalRow;
        this.selectionObj.startCol = colNumber;
        this.selectionObj.endCol = colNumber;
        this.selecting = true;
        this.renderAll();
    }

    mouseMoveHandler( e ) {
        if (!this.selecting ) return;

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
    }

    mouseUpHandler( e ) {
        this.selecting = false
    }
}