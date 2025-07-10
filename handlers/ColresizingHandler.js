export class ColResizing {
    constructor( resizingHandler, colLabelInstance, repositionActiveInput, cmdObjState, renderAllDataCanva, clearCellSelection, clearRowLabelSelection ) {
        this.resizing = false;
        this.resizingHandler = resizingHandler;
        this.colLableInstant = colLabelInstance;

        this.repositionActiveInput = repositionActiveInput;

        this.cmdObjState = cmdObjState;
        this.renderAllDataCanva = renderAllDataCanva;

    }

    hitTest(e) {
        const elm = document.elementFromPoint(e.clientX, e.clientY);

        if (elm.getAttribute('type') == "ColLabel" || this.resizing) {
            return true;
        }

        return false;
    }


    mouseDownHandler(e) {
        const colNum = Number(e.target.getAttribute('column'));
        const colLabel = this.colLableInstant.get(colNum);
        const onLine = colLabel.isOnLine(e.clientX, e.clientY);

        if (onLine !== -1) {
            if (this.interactionContext.mouseOverState == 'colInsert') {
                this.cellDataObj.shiftColKeys(onLine);
                this.renderAllDataCanva();
            }
            else if (this.interactionContext.mouseOverState == 'colResize') {
                this.cmdObjState.type = 'colResize';
                this.cmdObjState.oldValue = this.masterWobj.getValue(onLine - 1);
                this.cmdObjState.col = onLine - 1;
                this.interactionContext.mode = 'resize-col';
                this.interactionContext.startX = e.clientX;
                this.interactionContext.colLabel = colLabel;
                this.interactionContext.colNumber = onLine - 1;
            }
        }
        else {
            this.interactionContext.mode = 'colSelect';
            this.clearCellSelection();
            this.clearRowLabelSelection();
            this.columnLabelSelection(e)
        }
    }

    mouseUpHandler(e) {
        this.resizing = false;
    }

    mouseMoveHandler(e) {
        if (!this.resizing) return;


        document.body.style.cursor = 'col-resize';
        const dx = Math.floor(e.clientX - ctx.startX);
        this.cmdObjState.newVal = this.masterWobj.getValue(ctx.colNumber);
        this.resizingHandler({ canvaCol: ctx.colLabel.canvaColNumber, extra: dx, colNumber: ctx.colNumber });
        ctx.startX = e.clientX;
        if (this.activeInputCol === ctx.colNumber)
            this.inputElem.style.width = this.masterWobj.getValue(ctx.colNumber) + "px";
        this.repositionActiveInput();

    }
}