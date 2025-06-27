import adjustCanvasDPI from "../utils/adjustDpi.js";

export default class RowLabelCanva {
    constructor() {
        this.rowCountStart = 0;
        this.height = 0;
        this.width = 0;
        this.parentRef = null;

        //  Number of rows in one canva 
        this.rowNumber = 0;
        this.canvaRowNumber = null;
        this.rowIndex = 0;
        this._canva = document.createElement('canvas');
        this.ctx = this._canva.getContext('2d');
        this._canva.style.zIndex = 2;
        this.rowMobj = null;
        this.mpRowPos = new Map();
        this.moseOnIndx = -1;
        this.resizingHandler = null;
        this.state = {
            resizing: false,
            resizePointer: false
        }
        this.rect = this._canva.getBoundingClientRect();
        // have to set the rowIndex, androwMobj 
    }

    render() {
        this.height = this.rowMobj.cnvdM.getValue( this.canvaRowNumber );
        this._canva.style.height = this.height + "px";
        this._canva.style.width = this.width + "px";
        adjustCanvasDPI(this._canva, this.ctx);

        this.ctx.clearRect(0, 0, this._canva.width, this._canva.height);
        
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this._canva.width, this._canva.height);
        this.ctx.strokeStyle = '#ccc';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#000';

        // let rowHeight = this.height / this.rowNumber;
        let rowStartFrm =  this.rowNumber * this.canvaRowNumber ;

        let rowPos = 0 ;
        for (let r = 0; r < this.rowNumber; r++) {
            const y = rowPos;
            let rowHeight =  this.rowMobj.getValue( rowStartFrm + r );
            this.ctx.strokeRect(0, y, this.ctx.canvas.width, rowHeight);
            this.ctx.fillText((this.rowCountStart + r).toString(), this.ctx.canvas.width / 2, y + rowHeight / 2);
            rowPos += rowHeight;
        }
    }
    mouseDownDistanceHandler(e) {
        this.state.resizing = true;
        const canvas = e.target;
        const rect = canvas.getBoundingClientRect();

        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;

        // Set resize cursor on mousedown
        canvas.style.cursor = 'ns-resize';

        const onMouseUp = (ev) => {
            const endX = ev.clientX - rect.left;
            const endY = ev.clientY - rect.top;

            const dx = endX - startX;
            const dy = endY - startY;

            const distance = Math.sqrt(dx * dx + dy * dy);
            console.log(`Mouse moved: ${distance}px`);

            // Revert cursor to default on mouseup
            canvas.style.cursor = 'default';

            window.removeEventListener( 'mouseup', onMouseUp );
            this.parentRef.resizingHandler({ canvaRow: this.canvaRowNumber, extra: dy, rowNumber: this.moseOnIndx - 1  });
            this.state.resizing = false;
        };

        onMouseUp.bind(this);

        window.addEventListener('mouseup', onMouseUp);
    }

    isOnLine(x, y) {
        let threshold = 2;
        if (x >= 0 && x < this.width) {
            let tmp = 0;
            for (let i = this.rowIndex; i < this.rowIndex + this.rowNumber; i++) {
                if (Math.abs(y - tmp) <= threshold) {
                    return i;
                }
                tmp += this.rowMobj.getValue(i);
            }
        }
        return -1;
    }
    initialize(rowNumber, height, width, rowCountStart) {
        let tmp = 0;
        // for ( let i = this.rowIndex; i < this.rowIndex + this.rowNumber; i++ ) {
        //     this.mpRowPos.set( tmp, i );
        //     tmp += this.rowMobj.getValue( i );
        // }
        this.rowNumber = rowNumber;
        this.height = height;
        this.width = width;
        this.rowCountStart = rowCountStart;
        this.render();
        this.rect = this._canva.getBoundingClientRect();
        this._canva.addEventListener('mousedown', (e) => {
            if ( ( this.moseOnIndx != -1 && this.moseOnIndx != 0 ) && this.state.resizePointer) {
                this.mouseDownDistanceHandler(e);
            }
        });

        this._canva.addEventListener('mousemove', (e) => {
            if (this.state.resizing) {
                return;
            }
            let x = e.clientX - this.rect.left;
            let y = e.clientY - this.rect.top;
            // console.log(this.rect.top)
            let tmp = this.isOnLine(x, y);
            console.log(y);
            if (tmp != -1) {
                this.state.resizePointer = true;
                this._canva.style.cursor = 'ns-resize';
                this.moseOnIndx = tmp;
                console.log("on row line " + this.moseOnIndx)
            } else {
                this._canva.style.cursor = 'pointer'
                this.moseOnIndx = -1;
            }
        })
        

    }
}