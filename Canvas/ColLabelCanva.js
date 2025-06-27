import adjustCanvasDPI from "../utils/adjustDpi.js";

export default class ColLabelCanva {
    constructor() {
        this.colCountStart = "A";
        this.height = 25;
        this.width = 100;
        this.colNumber = 0;
        this._canva = document.createElement('canvas');
        this.ctx = this._canva.getContext('2d');
        this._canva.style.zIndex = 2;
    }

    render() {
        this._canva.style.height = this.height + "px";
        this._canva.style.width = this.width + "px";
        adjustCanvasDPI(this._canva, this.ctx);
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.strokeStyle = '#ccc';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#000';

        let colWidth = this.width / this.colNumber;
        let label = this.colCountStart;
        for (let c = 0; c < this.colNumber; c++) {
            const x = c * colWidth;
            label = this.getNextColumnLabel(label);
            this.ctx.strokeRect(x, 0, colWidth, this.ctx.canvas.height);
            this.ctx.fillText(label, x + colWidth / 2, this.ctx.canvas.height / 2);
        }
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

    initialize(colNumber, height, width, colCountStartNumber = 0) {
        this.colNumber = colNumber;
        this.height = height;
        this.width = width;
        this.colCountStart = ColLabelCanva.getColumnLabelFromNumber(colCountStartNumber);
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
