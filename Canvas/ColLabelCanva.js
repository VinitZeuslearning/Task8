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
        let threshold = 5;
        if (y >= 0 && y < this.height) {
            let tmp = this.colMobj.getValue(this.colStartFrm);
            let col = this.colStartFrm + 1;
            for (let i = 1; i <= this.colNumber; i++) {
                if (Math.abs(x - tmp) <= threshold) {
                    return col;
                }
                tmp += this.colMobj.getValue(col);
                col++;
            }
        }
        return -1;
    }

    initialize(colNumber, height, width, colCountStartNumber = 0) {
        this.colNumber = colNumber;
        this.height = height;
        this.width = width;
        this.colCountStart = ColLabelCanva.getColumnLabelFromNumber(colCountStartNumber);
        this.colStartFrm = this.colNumber * this.canvaColNumber;
        this.render();
        // this._canva.addEventListener('mousedown', (e) => {
        //     if ((this.mouseOnIndx != -1) && this.state.resizePointer) {
        //         this.mouseDownDistanceHandler(e);
        //     }
        // });
        // this._canva.addEventListener('mousemove', (e) => {
        //     if (this.state.resizing) {
        //         return;
        //     }
        //     this.rect = this._canva.getBoundingClientRect();
        //     let x = e.clientX - this.rect.left;
        //     let y = e.clientY - this.rect.top;
        //     // console.log(this.rect.top)
        //     let tmp = this.isOnLine(x, y);
        //     console.log(x);
        //     if (tmp != -1) {
        //         this.state.resizePointer = true;
        //         this._canva.style.cursor = 'col-resize';
        //         this.mouseOnIndx = tmp;
        //         console.log("on row line " + this.mouseOnIndx)
        //     } else {
        //         this._canva.style.cursor = 'pointer'
        //         this.mouseOnIndx = -1;
        //     }
        // })
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
