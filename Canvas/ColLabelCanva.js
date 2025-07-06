import adjustCanvasDPI from "../utils/adjustDpi.js";

export default class ColLabelCanva {
    constructor() {
        this.colCountStart = "A";
        this.parentRef = null;
        this.height = 25;
        this.width = 100;
        this.colNumber = 0;
        this.canvaColNumber = null;
        this._canva = document.createElement('canvas');
        this.ctx = this._canva.getContext('2d');
        this._canva.style.zIndex = 2;
        this.colMobj = null;
        this.mouseOnIndx = -1;
        this._canva.classList.add("labels");
        this.state = {
            resizing: false,
            resizePointer: false
        }
        this.colStartFrm = this.colNumber * this.canvaColNumber;


        this.slectionObj = null;
    }

    render() {
        // Set canvas dimensions via style
        this.width = this.colMobj.cnvdM.getValue(this.canvaColNumber)
        this._canva.style.height = this.height + "px";
        this._canva.style.width = this.width + "px";

        adjustCanvasDPI(this._canva, this.ctx);

        // Clear and fill background
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this._canva.width, this._canva.height);

        // Setup text and stroke styles
        this.ctx.strokeStyle = '#ccc';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#000';
        // this.ctx.lineWidth = 0.5;

        // Pixel-perfect alignment
        // this.ctx.save();
        // this.ctx.translate(1, 1);

        const colWidth = this.width / this.colNumber;
        let label = this.colCountStart;
        let colPos = 0;
        for (let c = 0; c < this.colNumber; c++) {
            const x = colPos;
            const colWidth = this.colMobj.getValue(this.colStartFrm + c);
            label = this.getNextColumnLabel(label);

            // Draw vertical line at start of this column
            this.ctx.beginPath();
            this.ctx.moveTo(x + 0.5, 0);
            this.ctx.lineTo(x + 0.5, colWidth);
            this.ctx.stroke();

            // Draw column label centered
            this.ctx.fillText(label, x + colWidth / 2, this._canva.height / 2);

            colPos += colWidth;
        }

        // ✅ No final right border line — intentionally left open

        // this.ctx.restore();

        this._canva.style.top = this.parentRef.scrollTop + "px";
        this._canva.style.left = this.colMobj.cnvdM.getPrefVal(this.canvaColNumber) + "px";

        if (this.slectionObj.start == null || this.slectionObj.end == null) {
            return;
        }

        // Ensure correct order
        const selStartCol = Math.min(this.slectionObj.start, this.slectionObj.end);
        const selEndCol = Math.max(this.slectionObj.start, this.slectionObj.end);

        // Canvas col range
        const canvasColStart = this.colStartFrm;
        const canvasColEnd = this.colStartFrm + this.colNumber - 1;

        // Skip if no overlap
        if (selEndCol < canvasColStart || selStartCol > canvasColEnd) {
            return;
        }

        // Compute pixel positions
        let selectionLeft = 0;
        colPos = canvasColStart;
        while (colPos < Math.max(selStartCol, canvasColStart)) {
            selectionLeft += this.colMobj.getValue(colPos);
            colPos++;
        }

        let selectionRight = selectionLeft;
        while (colPos <= Math.min(selEndCol, canvasColEnd)) {
            selectionRight += this.colMobj.getValue(colPos);
            colPos++;
        }

        const selectionWidth = selectionRight - selectionLeft;

        // Draw selection fill
        this.ctx.fillStyle = "rgba(0, 120, 215, 0.2)";
        this.ctx.fillRect(selectionLeft, 0, selectionWidth, this.height);

        // Draw selection border
        this.ctx.strokeStyle = "rgba(0, 120, 215, 0.8)";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        // Top border (always)
        this.ctx.moveTo(selectionLeft, 0);
        this.ctx.lineTo(selectionRight, 0);

        // Bottom border (always)
        this.ctx.moveTo(selectionLeft, this.height);
        this.ctx.lineTo(selectionRight, this.height);

        // Left border (if selStartCol inside canvas)
        if (selStartCol >= canvasColStart && selStartCol <= canvasColEnd) {
            this.ctx.moveTo(selectionLeft, 0);
            this.ctx.lineTo(selectionLeft, this.height);
        }

        // Right border (if selEndCol inside canvas)
        if (selEndCol >= canvasColStart && selEndCol <= canvasColEnd) {
            this.ctx.moveTo(selectionRight, 0);
            this.ctx.lineTo(selectionRight, this.height);
        }

        this.ctx.stroke();

    }


    static getColumnLabelFromNumber(num) {
    let label = '';
    while (num > 0) {
        num--; // adjust because Excel is 1-based
        label = String.fromCharCode(65 + (num % 26)) + label;
        num = Math.floor(num / 26);
    }
    return label;
}

// mouseDownDistanceHandler(e) {
//     this.state.resizing = true;

//     const canvas = e.target;
//     const rect = canvas.getBoundingClientRect();

//     let startX = e.clientX - rect.left;
//     let startY = e.clientY - rect.top;

//     // Set resize cursor on mousedown
//     canvas.style.cursor = 'col-resize';

//     const onMouseMove = (ev) => {
//         const endX = ev.clientX - rect.left;
//         const endY = ev.clientY - rect.top;

//         const dx = endX - startX;
//         const dy = endY - startY;



//         const distance = Math.sqrt(dx * dx + dy * dy);
//         console.log(`Mouse moved: ${distance}px`);

//         // Revert cursor to default on mouseup

//         this.parentRef.resizingHandler({ canvaCol: this.canvaColNumber, extra: dx, colNumber: this.mouseOnIndx - 1 });
//         startX += dx;
//         startY += dy;
//     };

//     onMouseMove.bind(this);

//     window.addEventListener('mousemove', onMouseMove);
//     const onMouseUp = (e) => {
//         window.removeEventListener('mousemove', onMouseMove);
//         window.removeEventListener('mouseup', onMouseUp);
//         canvas.style.cursor = 'default';
//         this.state.resizing = false;
//     }
//     window.addEventListener('mouseup', onMouseUp);
// }

isOnLine(xpos, ypos) {
    this.rect = this._canva.getBoundingClientRect();
    let x = xpos - this.rect.left;
    let y = ypos - this.rect.top
    let threshold = 2;
    let posX = 0;
    for ( let i = this.colStartFrm; i <= this.colStartFrm + this.colNumber; i++ ) {
        if ( Math.abs( posX - x ) <= threshold ) {
            return i;
        }
        posX += this.colMobj.getValue( i )
    }
    return -1;
}

findCol(x) {

    let posY = this.colMobj.cnvdM.getPrefVal(this.canvaColNumber);
    for (let i = this.colStartFrm; i <= this.colStartFrm + this.colNumber; i++) {
        if (x >= posY && x <= posY + this.colMobj.getValue(i)) {
            return i
        }
        posY += this.colMobj.getValue(i);
    }

    return -1;
}
getColPosition(colNumber) {
    if (colNumber < this.colStartFrm || colNumber > this.colStartFrm + this.colNumber) {
        return -1; // out of visible canvas range
    }

    let posX = this.colMobj.cnvdM.getPrefVal( this.canvaColNumber );
    for (let i = this.colStartFrm; i < colNumber; i++) {
        posX += this.colMobj.getValue(i);
    }
    return posX;
}


initialize(colNumber, height, width, colCountStartNumber = 0) {
    this.colNumber = colNumber;
    this.height = height;
    this.width = width;
    this.colCountStart = ColLabelCanva.getColumnLabelFromNumber(colCountStartNumber);
    this.colStartFrm = this.colNumber * this.canvaColNumber;
    this.render();
}

getNextColumnLabel(colLabel) {
    let carry = 1;
    let result = '';

    for (let i = colLabel.length - 1; i >= 0; i--) {
        const charCode = colLabel.charCodeAt(i) - 65;
        const sum = charCode + carry;
        if (sum === 26) {
            result = 'A' + result;
            carry = 1;
        } else {
            result = String.fromCharCode(65 + sum) + result;
            carry = 0;
        }
    }
    if (carry === 1) result = 'A' + result;
    return result;
}

getCanvasElement() {
    return this._canva;
}
}
