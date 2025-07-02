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
        this.colMObj = null;
        this.moseOnIndx = -1;
        this.state = {
            resizing: false,
            resizePointer: false
        }
        this.rect = this._canva.getBoundingClientRect();
        this.rowStartFrm = this.rowNumber * this.canvaRowNumber;
        // have to set the rowIndex, androwMobj 
    }

    render() {
        // Get current canvas height from row manager
        this.height = this.rowMobj.cnvdM.getValue(this.canvaRowNumber);

        // Update canvas DOM size
        this._canva.style.height = this.height + "px";
        this._canva.style.width = this.width + "px";
        this._canva.classList.add("labels")

        adjustCanvasDPI(this._canva, this.ctx);

        // Clear and fill background
        this.ctx.clearRect(0, 0, this._canva.width, this._canva.height);
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this._canva.width, this._canva.height);

        // Setup text and stroke styles
        this.ctx.strokeStyle = '#ccc';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#000';
        // this.ctx.lineWidth = 1;

        // Pixel-perfect line alignment
        // this.ctx.save();
        // this.ctx.translate(0.5, 0.5);

        let rowPos = 0;

        for (let r = 0; r < this.rowNumber; r++) {
            const y = rowPos;
            const rowHeight = this.rowMobj.getValue(this.rowStartFrm + r);

            // Draw horizontal line at top of this row
            this.ctx.beginPath();
            this.ctx.moveTo(0, y + 0.5);
            this.ctx.lineTo(this.ctx.canvas.width, y + 0.5);
            this.ctx.stroke();

            // Draw row number text centered vertically in row
            this.ctx.fillText(
                (this.rowCountStart + r).toString(),
                this.ctx.canvas.width / 2,
                y + rowHeight / 2
            );

            rowPos += rowHeight;
        }

        this._canva.style.left = this.parentRef.scrollLeft + "px";
        this._canva.style.top = this.rowMobj.cnvdM.getPrefVal(this.canvaRowNumber) + "px";
    }

    isOnLine(xpos, ypos) {
        this.rect = this._canva.getBoundingClientRect();
        let x = xpos - this.rect.left;
        let y = ypos - this.rect.top;
        let threshold = 5;
        if (x >= 0 && x < this.width) {
            let tmp = this.rowMobj.getValue(this.rowStartFrm);
            let row = this.rowStartFrm + 1;
            for (let i = this.rowIndex + 1; i <= this.rowIndex + this.rowNumber; i++) {
                if (Math.abs(y - tmp) <= threshold) {
                    return row;
                }
                tmp += this.rowMobj.getValue(row);
                row++;
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
        this.rowStartFrm = this.rowNumber * this.canvaRowNumber;
        this.render();
        this.rect = this._canva.getBoundingClientRect();
        // this._canva.addEventListener('mousedown', (e) => {
        //     if ((this.moseOnIndx != -1) && this.state.resizePointer) {
        //         this.mouseDownDistanceHandler(e);
        //     }
        // });

        // this._canva.addEventListener('mousemove', (e) => {
        //     if (this.state.resizing) {
        //         return;
        //     }

        //     // console.log(this.rect.top)
        //     let tmp = this.isOnLine(x, y);
        //     console.log(y);
        //     if (tmp != -1) {
        //         this.state.resizePointer = true;
        //         this._canva.style.cursor = 'row-resize';
        //         this.moseOnIndx = tmp;
        //         console.log("on row line " + this.moseOnIndx)
        //     } else {
        //         this._canva.style.cursor = 'pointer'
        //         this.moseOnIndx = -1;
        //     }
        // })


    }
}