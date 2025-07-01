export default class InputTxt {
    constructor() {
        this.canvaRowInd = 0;
        this.canvaColInd = 0;
        this.cellRow = 0;
        this.cellCol = 0;
        this.masterHobj = null;
        this.masterWobj = null;
        this.posX = 0;
        this.posY = 0;
        this.colsPerCanva = 0;
        this.rowsPerCanva = 0;
        this.cellDataObj = null;
        this.canvaObj = null;
        this.renderHandler = null;

        this._inpElm = document.getElementById("inputTxt");

        this.isCellValueChanged = false;
    }

    render(position = null) {
        // if position provided, use it; else compute


        this._inpElm.value = "";
        if (position) {
            this.posX = position.posX;
            this.posY = position.posY;
        } else {
            let posY = this.masterHobj.cnvdM.getPrefVal(this.canvaRowInd);
            let posX = this.masterWobj.cnvdM.getPrefVal(this.canvaColInd);

            for (let i = this.canvaRowInd * this.rowsPerCanva; i < this.cellRow; i++) {
                posY += this.masterHobj.getValue(i);
            }

            for (let j = this.canvaColInd * this.colsPerCanva; j < this.cellCol; j++) {
                posX += this.masterWobj.getValue(j);
            }

            this.posX = posX;
            this.posY = posY;
        }

        // position and size the input element
        this._inpElm.style.top = this.posY + "px";
        this._inpElm.style.left = this.posX + "px";
        this._inpElm.style.height = (this.masterHobj.getValue(this.cellRow) - 2) + "px";
        this._inpElm.style.width = (this.masterWobj.getValue(this.cellCol) - 2) + "px";

        // update input value from cellDataObj
        this._inpElm.value = this.cellDataObj.get(this.cellRow, this.cellCol);
    }

    beforeRenderHandler() {
        this.cellDataObj.set(this.cellRow, this.cellCol, this._inpElm.value)
        this.renderHandler(this.canvaRowInd, this.canvaColInd);
    }

    setCanvaObj(obj) {
        this.canvaObj = obj;
    }


    initialize() {
        this._inpElm.addEventListener('input', (e) => {
            if (e.target.value != this.cellDataObj.get(this.cellRow, this.cellCol)) {
                this.isCellValueChanged = true;
            }
            else {
                this.isCellValueChanged = false;
            }
        })
    }

}
