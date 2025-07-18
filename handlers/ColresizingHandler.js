export class ColResizing {
    constructor(resizingHandler, colLabelInstance, renderInputElm, cmdObj, renderAllDataCanva, cellDataObj, parent, masterWobj) {
        this.resizing = false;
        this.resizingHandler = resizingHandler;
        this.colLableInstant = colLabelInstance;
        this.renderInputElm = renderInputElm;
        this.cmdObj = cmdObj;
        this.renderAllDataCanva = renderAllDataCanva;
        this.interactionContext = {
            startX: 0,
            startY: 0,
            colLabel: null,
            colNumber: null,
            oldValue: null,
        }
        this.cellDataObj = cellDataObj;
        this.colLabelHeight = 20;
        this.parent = parent;
        this.masterWobj = masterWobj
    }

    hitTest(e) {
        const elm = document.elementFromPoint(e.clientX, e.clientY);

        if ( ! elm.getAttribute('type') == "ColLabel") {
            return false;
        }

        const inst = this.colLableInstant.get( Number( elm.getAttribute( 'column' ) ) );
        if ( !inst ) {
            return false;
        }

        const onLine = inst.isOnLine( e.clientX, e.clientY );
        if ( onLine != -1 ) {
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
        const colNum = Number(e.target.getAttribute('column'));
        const colLabel = this.colLableInstant.get(colNum);
        const onLine = colLabel.isOnLine(e.clientX, e.clientY);
        this.interactionContext.oldValue = this.masterWobj.getValue()

        if (onLine !== -1) {
            const posY = this.getRelativePos(e).y;
            if ( posY < this.colLabelHeight / 2 ) {
                this.cellDataObj.shiftColKeys(onLine);
                this.renderAllDataCanva();
            }
            else{
                this.interactionContext.oldValue = this.masterWobj.getValue(onLine - 1);
                this.interactionContext.mode = 'resize-col';
                this.interactionContext.startX = e.clientX;
                this.interactionContext.colLabel = colLabel;
                this.interactionContext.colNumber = onLine - 1;

                this.resizing = true;
            } 
        }
    }

    mouseUpHandler(e) {
        this.resizing = false;
        const newVal = this.masterWobj.getValue( this.interactionContext.colNumber );

        this.cmdObj.pushResizeColCmd( newVal, this.interactionContext.oldValue, this.interactionContext.colNumber );
    }

    mouseMoveHandler(e) {
        if (!this.resizing) return;

        const ctx = this.interactionContext;

        // To do have to fix this to support the resizing event mouse is moving outside the col
        const elm = document.elementFromPoint(e.clientX, e.clientY);

        if (this.resizing) {
            document.body.style.cursor = 'col-resize';
            const dx = Math.floor(e.clientX - ctx.startX);
            this.resizingHandler({ canvaCol: ctx.colLabel.canvaColNumber, extra: dx, colNumber: ctx.colNumber });
            ctx.startX = e.clientX;
            if (this.activeInputCol === ctx.colNumber)
                this.inputElem.style.width = this.masterWobj.getValue(ctx.colNumber) + "px";
            this.renderInputElm();
        }

        const colNum = Number(elm.getAttribute('column'));
        const colLabel = this.colLableInstant.get(colNum);
        const line = colLabel.isOnLine(e.clientX, e.clientY);

        if (line != -1) {
            const posY = this.getRelativePos(e).y;
            if (posY < this.colLabelHeight / 2) {
                document.body.style.cursor = 'crosshair';
                ctx.mouseOverState = 'colInsert';
            }
            else {
                document.body.style.cursor = 'col-resize';
                ctx.mouseOverState = 'colResize';
            }

        }

        // getCursor( ) {
        //     const colNum = Number( elm.getAttribute( 'column' ) );
        //     const colLabel = this.colLableInstant.get( colNum );
        //     const line = colLabel.isOnLine( e.clientX, e.clientY );

        //     if ( line != -1 ) {
        //         const posY = this.getRelativePos( e ).yl
        //         if ( posY < this.col )
        //     }
        // }
    }

}