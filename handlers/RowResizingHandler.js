export class RowResizing {
    constructor(resizingHandler, rowLabelInstance, renderInputElm, cmdObj, renderAllDataCanva, cellDataObj, parent, masterHobj) {
        this.resizing = false;
        this.resizingHandler = resizingHandler;
        this.renderInputElm = renderInputElm;
        this.cmdObj = cmdObj;
        this.renderAllDataCanva = renderAllDataCanva;
        this.interactionContext = {
            startX: 0,
            startY: 0,
            rowLabel: null,
            rowNumber: null,
            oldValue : null,
        }
        this.cellDataObj = cellDataObj;
        this.rowLabelHeight = 20;
        this.parent = parent;
        this.masterHobj = masterHobj
    }

    hitTest(e) {
        const elm = document.elementFromPoint(e.clientX, e.clientY);

        const inst = this.rowLabelInstance.get( Number( elm.getAttribute( 'row' ) ) );

        if ( !inst ) {
            return false;
        }

        const onLine = inst.isOnLine( e.clientX, e.clientY );

        if (elm.getAttribute('type') == "RowLabel" && onLine != -1 ) {
            console.log("hit test rowLabel")
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
        const rowNum = Number(e.target.getAttribute('row'));
        const rowLabel = this.rowLabelInstance.get(rowNum);
        const onLine = rowLabel.isOnLine(e.clientX, e.clientY);

        if (onLine !== -1) {
            const posY = this.getRelativePos(e).y;
            if (posY < this.rowLabelHeight / 2) {
                this.cellDataObj.shiftRowKeys(onLine);
                this.renderAllDataCanva();
            }
            else {
                this.interactionContext.mode = 'resize-row';
                this.interactionContext.oldValue = this.masterHobj.getValue( onLine - 1 )
                this.interactionContext.startY = e.clientY;
                this.interactionContext.rowLabel = rowLabel;
                this.interactionContext.rowNumber = onLine - 1;

                this.resizing = true;
            }
        }
    }

    mouseUpHandler(e) {
        this.resizing = false;
        this.cmdObj.pushResizeRowCmd( this.masterHobj.getValue( this.interactionContext.rowNumber ), this.interactionContext.oldValue, this.interactionContext.rowNumber )
    }

    mouseMoveHandler(e) {
        if (!this.resizing) return;

        // To do - have to fix this strict number

        const ctx = this.interactionContext;
        const rowLblElm = document.elementFromPoint(50 + 5, e.clientY);

        document.body.style.cursor = 'row-resize';
        const dy = Math.floor(e.clientY - ctx.startY);
        this.resizingHandler({ canvaRow: ctx.rowLabel.canvaRowNumber, extra: dy, rowNumber: ctx.rowNumber });
        ctx.startY = e.clientY;
        if (this.activeInputRow === ctx.rowNumber)
            this.inputElem.style.height = this.masterHobj.getValue(ctx.rowNumber) + "px";
        this.renderInputElm();
    }

}