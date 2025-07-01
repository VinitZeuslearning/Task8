// import RCManager from "./rcManager";
import TwoLevelMap from "./twolevelmap.js";
import RCManager from "./DataStructure/RmCnvManager.js";
import RowLabelCanva from "./Canvas/RowLabelCanva.js";
import ColLabelCanva from "./Canvas/ColLabelCanva.js";
import CellData from "./DataStructure/CellData.js";
import Canva from "./Canvas/DataCanvas.js";
import InputTxt from "./Canvas/inputElm.js";
/*
what to do next 

1) add one render method in the canvamanger which just render the all canva without creating new instance 
2) pass the proepr parameter to the label class and also pass the handler which will be called when the resizing hapening 
3) also need to add the way to maintain the canva instance in canvamanager for canva which are visible . Just maintain the array of size of exactly same as the this.lowerbound - this.upperbound for row , col , rowLable and colLabel


*/




// class to manager the Canvas class



class CanvasManager {

    constructor() {

        // row Label width
        this.rowLabelCanvaW = 50;

        // col label height
        this.colLabelCanvaH = 20;
        this.containerRct = document.getElementById("Container").getBoundingClientRect();
        this.rows = 100000;
        this.cols = 500;
        this.cellWidth = 100;
        this.cellHeight = 20;
        this.rowsPerCanva = 20;
        this.colsPerCanva = 8;
        this.extraCanva = 1;
        this.elmsPerCava = this.rowsPerCanva * this.colsPerCanva;
        this.canvaMagnagerElm = document.getElementById('canvaManager');
        this.viewPort = document.getElementById('InnerContiner');
        this.viewPortRect = this.viewPort.getBoundingClientRect();
        this.canvaH = this.rowsPerCanva * this.cellHeight;
        this.canvaW = this.colsPerCanva * this.cellWidth;
        this.canvasHorizontal = (Math.ceil(this.viewPortRect.width / this.canvaW)) + this.extraCanva;
        this.canvasVertical = (Math.ceil(this.viewPortRect.height / this.canvaH)) + this.extraCanva;
        this.scrollTop = 0;
        this.scrollLeft = 0;
        this.viewPortHeight = this.viewPortRect.height;
        this.viewPortWidth = this.viewPortRect.width;
        this.height = this.rows * this.cellHeight;
        this.width = this.cols * this.cellWidth;
        this.totalCanvaVer = this.rows / this.rowsPerCanva;
        this.totalCanvaHor = this.cols / this.colsPerCanva;
        this.cnvInst = new TwoLevelMap();
        this.colCnvLabelInst = new Map();
        this.rowCnvLabelInst = new Map();

        this.totalActiveCanvasRow;
        this.totalActiveCanvasCol;
        // vertical delta change for smooth scroll
        this.verDxForSmthScroll = 400;

        // horizontal delta change for smooth scroll
        this.horDxForSmthScroll = 400;

        // canvas vertical lower bound
        this.cnvRowLwrBnd = 0;

        // canvas vertical upper bound
        this.cnvRowUprBnd = 0;

        // canvas horizontal upper bound
        this.cnvColLwrBnd = 0;

        // canvas horizontal upper bound
        this.cnvColUprBnd = 0;

        this._render = true;

        this.rowM = new RCManager(this.rows, this.cellHeight, this.rowsPerCanva, this.colLabelCanvaH);
        this.colM = new RCManager(this.cols, this.cellWidth, this.colsPerCanva, this.rowLabelCanvaW);

        this._isInstantRenderRequire = true;

        this.inputStateM = new InputTxt( );
        this.inputStateM.masterHobj = this.rowM;
        this.inputStateM.masterWobj = this.colM;
        this.inputStateM.colsPerCanva = this.colsPerCanva
        this.inputStateM.rowsPerCanva = this.rowsPerCanva;
        this.cellDataObj = new CellData()
        this.inputStateM.cellDataObj = this.cellDataObj;
    }

    resizingHandler(obj) {
        let tmp;
        let i;
        let j;
        if (obj.canvaRow != undefined) {

            // tmp = this.rowM.cnvdM.getValue(obj.row)
            // this.rowM.cnvdM.update(obj.row, tmp + obj.extra);


            // this will auto update the canva prefix and size
            let row = obj.rowNumber;
            tmp = this.rowM.getValue(row);
            if (this.rowM.getValue(row) + obj.extra < this.cellHeight) {
                return;
            }
            this.rowM.incre(row, obj.extra);

            // changing top of every element 



            for (let i = obj.canvaRow + 1; i <= this.cnvRowUprBnd; i++) {
                for (let j = Math.max(this.cnvColLwrBnd, 0); j <= this.cnvColUprBnd; j++) {
                    tmp = this.cnvInst.get(i, j);
                    tmp._canva.style.top = this.rowM.cnvdM.getPrefVal(i) + "px";
                }
            }

            // canvaLabel 
            // rendering label 
            tmp = this.rowCnvLabelInst.get(obj.canvaRow);
            tmp.render();
            for (let i = obj.canvaRow + 1; i <= this.cnvRowUprBnd; i++) {
                tmp = this.rowCnvLabelInst.get(i);
                tmp._canva.style.top = this.rowM.cnvdM.getPrefVal(i) + "px";
            }


            for (let i = Math.max(this.cnvColLwrBnd, 0); i <= this.cnvColUprBnd; i++) {
                tmp = this.cnvInst.get(obj.canvaRow, i);
                // rendering the canva
                tmp.render();
            }

        }
        else {
            let col = obj.colNumber;
            tmp = this.colM.getValue(col);
            if (this.colM.getValue(col) + obj.extra < this.cellWidth) {
                return;
            }
            if (this.colM.getValue(col) + obj.extra > 55) {
                console.log()
            }
            if (obj.extra >= 2) {
                console.log()
            }
            this.colM.incre(col, obj.extra);


            for (let j = obj.canvaCol + 1; j <= this.cnvColUprBnd; j++) {
                for (let i = Math.max(this.cnvRowLwrBnd, 0); i <= this.cnvRowUprBnd; i++) {
                    tmp = this.cnvInst.get(i, j);
                    tmp._canva.style.left = this.colM.cnvdM.getPrefVal(j) + "px";
                }
            }

            // rendering label 

            tmp = this.colCnvLabelInst.get(obj.canvaCol);
            tmp.render();
            for (let j = obj.canvaCol + 1; j <= this.cnvColUprBnd; j++) {
                tmp = this.colCnvLabelInst.get(j);
                tmp._canva.style.left = this.colM.cnvdM.getPrefVal(j) + "px";
            }

            for (let i = Math.max(this.cnvRowLwrBnd, 0); i <= this.cnvRowUprBnd; i++) {
                tmp = this.cnvInst.get(i, obj.canvaCol);
                tmp.render();
            }
        }

        this.inputStateM.render();
    }

    renderAll() {
        // repaint
        for (const [key, value] of this.cnvInst) {
            value.render();
        }
        for (const [key, value] of this.colCnvLabelInst) {
            value.render();
        }
        for (const [key, value] of this.rowCnvLabelInst) {
            value.render();
        }
    }

    removeRow(r, isLabel = true) {
        if (r < 0 || r >= this.totalCanvaVer) {
            return;
        }
        let row = r;
        let col = this.cnvColLwrBnd;
        for (; col <= this.cnvColUprBnd; col++) {
            let elm = document.getElementById(`${row}_${col}`);
            this.cnvInst.delete(row, col);
            if (elm) {
                this.canvaMagnagerElm.removeChild(elm);
            }
        }

        if (isLabel) {
            this.removeRowLabel(r);
        }
    }


    removeCol(c, isLabel = true) {
        if (c < 0 || c >= this.totalCanvaHor) {
            return;
        }
        let col = c;
        let row = this.cnvRowLwrBnd;

        for (; row <= this.cnvRowUprBnd; row++) {
            let elm = document.getElementById(`${row}_${col}`);
            // this.colCnvLabelInst.delete( row, col );
            this.cnvInst.delete(row, col);
            if (elm) {
                this.canvaMagnagerElm.removeChild(elm);
            }
        }

        if (isLabel) {
            this.removeColLabel(c);
        }
    }

    appendCol(c, isLabel = true) {
        // console.log(`append col of ${c}`)
        if (c < 0 || c >= this.totalCanvaHor) {
            return;
        }
        let col = c;
        let row = this.cnvRowLwrBnd;
        let left = this.colM.cnvdM.getPrefVal(col);
        let top = this.rowM.cnvdM.getPrefVal(row);
        for (; row <= this.cnvRowUprBnd; row++) {
            const pstElm = document.getElementById(row + "_" + col);
            if (pstElm || row < 0 || row >= this.totalCanvaVer) {
                continue;
            }
            top = this.rowM.cnvdM.getPrefVal(row);

            // creating the instance of the canva
            let elm = this.cnvInstCreater(row, col);
            this.canvaMagnagerElm.append(elm._canva);
            elm._initialize(this.cellHeight, this.cellWidth, this.rowsPerCanva, this.colsPerCanva);
        }


        if (isLabel) {
            this.appendColLabel(c);
        }
    }

    appendRow(r, isLabel = true) {
        const tmpRow = r;
        // console.log(`append row of ${r}`)
        if (r == 2) {
            console.log()
        }
        if (r < 0 || r >= this.totalCanvaVer) {
            return;
        }


        let row = r;
        let col = this.cnvColLwrBnd;
        // let left = col * this.canvaW;
        let left = this.colM.cnvdM.getPrefVal(col);
        let top = this.rowM.cnvdM.getPrefVal(row);
        for (; col <= this.cnvColUprBnd; col++) {
            const pstElm = document.getElementById(row + "_" + col);
            if (pstElm || col < 0 || col >= this.totalCanvaHor) {
                continue;
            }
            left = this.colM.cnvdM.getPrefVal(col);

            // creating canva instance and initilizing it

            let elm = this.cnvInstCreater(row, col);

            elm._initialize(this.cellHeight, this.cellWidth, this.rowsPerCanva, this.colsPerCanva);
        }

        if (isLabel) {
            this.appendRowLabel(r);
        }
    }

    appendRowLabel(r) {
        if (document.getElementById("R" + r)) { return }
        let labelElm = new RowLabelCanva();
        labelElm.parentRef = this;
        labelElm.canvaRowNumber = r;
        labelElm.resizingHandler = this.resizingHandler;
        this.rowCnvLabelInst.set(r, labelElm);
        labelElm._canva.style.left = this.scrollLeft + "px";
        labelElm._canva.style.top = this.rowM.cnvdM.getPrefVal(r) + "px";
        labelElm.rowMobj = this.rowM;
        labelElm.rowNumber = (r + 1) * this.rowsPerCanva;
        this.canvaMagnagerElm.append(labelElm._canva);
        labelElm._canva.id = "R" + r;
        labelElm.initialize(this.rowsPerCanva, this.canvaH, this.rowLabelCanvaW, r * this.rowsPerCanva);
    }

    appendColLabel(c) {
        if (document.getElementById("C" + c)) { return }
        let labelElm = new ColLabelCanva();
        labelElm.parentRef = this;
        labelElm.canvaColNumber = c;
        this.colCnvLabelInst.set(c, labelElm);
        this.canvaMagnagerElm.append(labelElm._canva);
        labelElm._canva.id = "C" + c;
        labelElm._canva.style.top = this.scrollTop + "px";
        labelElm.colMobj = this.colM;
        labelElm.colNumber = (c + 1) * this.colsPerCanva;
        labelElm._canva.style.left = this.colM.cnvdM.getPrefVal(c) + "px";
        labelElm.initialize(this.colsPerCanva, this.colLabelCanvaH, this.canvaW, c * this.colsPerCanva)
    }

    removeRowLabel(r) {
        let elm = document.getElementById("R" + r);
        if (!elm) { return }
        this.rowCnvLabelInst.delete(r);
        this.canvaMagnagerElm.removeChild(elm);
    }

    removeColLabel(c) {
        let elm = document.getElementById("C" + c);
        if (!elm) { return }
        this.colCnvLabelInst.delete(c);
        this.canvaMagnagerElm.removeChild(elm);
    }

    updateRowLabelPos() {
        if (!this._render) {
            this.clearChilds();
            return;
        }
        let i = 0;
        for (i = this.cnvRowLwrBnd; i <= this.cnvRowUprBnd; i++) {
            let elm = document.getElementById("R" + i);
            if (!elm) { continue }
            elm.style.left = this.scrollLeft + "px";
        }
    }

    updateColLabelPos() {
        if (!this._render) {
            this.clearChilds();
            return;
        }
        let i = 0;
        for (i = this.cnvColLwrBnd; i <= this.cnvColUprBnd; i++) {
            let elm = document.getElementById("C" + i);
            if (!elm) { continue }
            elm.style.top = this.scrollTop + "px";
        }
    }

    clearChilds() {
        this.canvaMagnagerElm.innerHTML = "";
    }

    cnvInstCreater(row, col) {
        let inst = new Canva();
        // this.rowCavaInstance

        this.cnvInst.insert(row, col, inst);
        this.canvaMagnagerElm.append(inst._canva);
        inst.masterWobj = this.colM;
        inst.canvaRowIndex = row;
        inst.canvaColIndex = col;
        inst.masterHobj = this.rowM;
        inst.canvaHeight = this.rowM.cnvdM.getValue(row);
        inst.canvaWidth = this.colM.cnvdM.getValue(col);
        inst._canva.style.top = this.rowM.cnvdM.getPrefVal(row) + "px";
        inst._canva.style.left = this.colM.cnvdM.getPrefVal(col) + "px";
        inst._canva.id = row + "_" + col;
        inst.cellDataObj  = this.cellDataObj;
        inst.inputElmObj = this.inputStateM;
        inst.resizeHandler = this.instantScrollRender.bind( this );
        return inst;
    }

    // flage 1 ----> row render
    // flage 0 ----> col render
    // flage 2 ----> both need to be rerender
    instantScrollRender(flage) {
        if (!this._render || !this._isInstantRenderRequire) return;

        const scrollLeft = Math.trunc(this.scrollLeft);
        const scrollTop = Math.trunc(this.scrollTop);

        // Find visible top-left cell indices based on cumulative prefix sum
        const horInd = this.colM.cnvdM.findLowerBoundIndex(scrollLeft);
        const verInd = this.rowM.cnvdM.findLowerBoundIndex(scrollTop);

        // Calculate lower and upper bounds for both axes (with extraCanva buffer)
        this.cnvColLwrBnd = horInd - this.extraCanva;
        this.cnvColUprBnd = horInd + (this.canvasHorizontal - 1) + this.extraCanva;
        this.cnvRowLwrBnd = verInd - this.extraCanva;
        this.cnvRowUprBnd = verInd + (this.canvasVertical - 1) + this.extraCanva;

        // Clear previous canvas children
        this.clearChilds();

        // Append columns if required
        if (flage === 0 || flage === 2) {
            for (let j = this.cnvColLwrBnd; j <= this.cnvColUprBnd; j++) {
                this.appendCol(j, true);
            }
        }

        // Append rows if required
        if (flage === 1 || flage === 2) {
            for (let j = this.cnvRowLwrBnd; j <= this.cnvRowUprBnd; j++) {
                this.appendRow(j, true);
            }
        }

        this._isInstantRenderRequire = false;
    }


    smoothScrollRender(isVerticalMove) {
        if (!this._render) {
            this.clearChilds();
            return;
        }
        if (!isVerticalMove) {
            // const scrollLeft = Math.trunc(this.scrollLeft);
            // // let horInd = Math.trunc(scrollLeft / this.canvaW);
            // let horInd = Math.trunc(scrollLeft / this.canvaW);


            // Remove left-side columns
            while (this.scrollLeft > this.colM.cnvdM.getPrefVal(this.cnvColLwrBnd + 1)) {
                this.removeCol(this.cnvColLwrBnd, true);
                this.cnvColLwrBnd++;
            }

            // Add left-side columns if necessary
            while (this.scrollLeft < this.colM.cnvdM.getPrefVal(this.cnvColLwrBnd)) {
                this.appendCol(this.cnvColLwrBnd - 1, true);
                this.cnvColLwrBnd--;
            }

            // Add right-side columns if necessary
            while (this.scrollLeft + this.containerRct.width > this.colM.cnvdM.getPrefVal(this.cnvColUprBnd + 1)) {
                this.appendCol(this.cnvColUprBnd + 1);
                this.cnvColUprBnd++;
            }

            // Remove right-side columns if necessary
            while (this.scrollLeft + this.containerRct.width < this.colM.cnvdM.getPrefVal(this.cnvColUprBnd)) {
                this.removeCol(this.cnvColUprBnd);
                this.cnvColUprBnd--;
            }


            // if ( this.scrollLeft > this.colM.cnvdM.getPrefVal( this.cnvColLwrBnd + 1 ) ) {
            //     this.removeCol( this.cnvColLwrBnd, true );
            //     this.cnvColLwrBnd++;
            // }

            // if ( this.scrollLeft < this.colM.cnvdM.getPrefVal( this.cnvColLwrBnd  ) ) {
            //     this.appendCol( this.cnvColLwrBnd - 1, true  );
            //     this.cnvColLwrBnd--;
            // }

            // if ( this.scrollLeft + this.containerRct.width > this.colM.cnvdM.getPrefVal( this.cnvColUprBnd + 1 ) ) {
            //     this.appendCol( this.cnvColUprBnd + 1 );
            //     this.cnvColUprBnd++;
            // }

            // if ( this.scrollLeft + this.containerRct.width < this.colM.cnvdM.getPrefVal(  this.cnvColUprBnd ) ) {
            //     this.removeCol( this.cnvColUprBnd );
            //     this.cnvColUprBnd--;
            // }


            // // For Horizontal
            // if (horInd >= 1) {
            //     console.log();
            // }
            // if ((horInd + this.canvasHorizontal) > this.cnvColUprBnd + 1) {
            //     this.removeCol(this.cnvColLwrBnd, true);
            //     this.cnvColUprBnd = horInd + this.canvasHorizontal - 1;
            //     this.cnvColLwrBnd = horInd - this.extraCanva;
            //     this.appendCol(this.cnvColUprBnd, true);
            // }
            // else if (horInd - this.extraCanva < this.cnvColLwrBnd) {
            //     this.removeCol(this.cnvColUprBnd);
            //     this.cnvColUprBnd = horInd + this.canvasHorizontal - 1;;
            //     this.cnvColLwrBnd = horInd - this.extraCanva;
            //     this.appendCol(this.cnvColLwrBnd);
            // }
        }
        else {
            // For vertical

            // Remove top-side rows
            while (this.scrollTop > this.rowM.cnvdM.getPrefVal(this.cnvRowLwrBnd + 1)) {
                this.removeRow(this.cnvRowLwrBnd, true);
                this.cnvRowLwrBnd++;
            }

            // Add top-side rows if necessary
            while (this.scrollTop < this.rowM.cnvdM.getPrefVal(this.cnvRowLwrBnd)) {
                this.appendRow(this.cnvRowLwrBnd - 1, true);
                this.cnvRowLwrBnd--;
            }

            // Remove bottom-side rows if necessary
            while (this.scrollTop + this.containerRct.height < this.rowM.cnvdM.getPrefVal(this.cnvRowUprBnd)) {
                this.removeRow(this.cnvRowUprBnd, true);
                this.cnvRowUprBnd--;
            }

            // Add bottom-side rows if necessary
            while (this.scrollTop + this.containerRct.height > this.rowM.cnvdM.getPrefVal(this.cnvRowUprBnd + 1)) {
                this.appendRow(this.cnvRowUprBnd + 1, true);
                this.cnvRowUprBnd++;
            }

            // const scrollTop = Math.trunc(this.scrollTop);
            // let verInd = Math.trunc(scrollTop / this.canvaH);
            // if ((verInd + this.canvasVertical + this.extraCanva) > this.cnvRowUprBnd + 1) {
            //     this.removeRow(this.cnvRowLwrBnd);
            //     this.cnvRowUprBnd = verInd + this.canvasVertical + this.extraCanva - 1;
            //     this.cnvRowLwrBnd = verInd - this.extraCanva;
            //     this.appendRow(this.cnvRowUprBnd);
            // }
            // else if (verInd - this.extraCanva < this.cnvRowLwrBnd) {
            //     this.removeRow(this.cnvRowUprBnd);
            //     this.cnvRowUprBnd = verInd + this.canvasVertical + this.extraCanva - 1;
            //     this.cnvRowLwrBnd = verInd - this.extraCanva;
            //     this.appendRow(this.cnvRowLwrBnd);
            // }
        }

    }

    handleInputChange( canvaRow, canvCol ) {
        let obj = this.cnvInst.get( canvaRow, canvCol );
        if ( obj ) {
            obj.render();
        }
    }
    initialize() {
        this.viewPort.addEventListener('scroll', () => {
            let dx = Math.abs(this.scrollLeft - this.viewPort.scrollLeft);
            let dy = Math.abs(this.scrollTop - this.viewPort.scrollTop);

            // console.log(`dx: ${dx}, dy: ${dy}`)
            this.scrollTop = this.viewPort.scrollTop;
            this.scrollLeft = this.viewPort.scrollLeft;


            if (dx > 900) {
                console.log();
            }
            if (dx > 0) {
                this.updateRowLabelPos();
            }

            if (dy > 0) {
                this.updateColLabelPos();
            }


            if (dx >= this.horDxForSmthScroll || dy >= this.verDxForSmthScroll) {
                this._render = false;
                this._isInstantRenderRequire = true;
            }
            else {
                this._render = true;
            }
            if (dx > 0) {
                if (dx <= this.horDxForSmthScroll && !this._isInstantRenderRequire) {
                    this.smoothScrollRender(false);
                }
            }

            if (dy > 0) {
                if (dy <= this.horDxForSmthScroll && !this._isInstantRenderRequire) {
                    this.smoothScrollRender(true);
                }
            }
        });

        this.viewPort.addEventListener('scrollend', () => {
            // console.log("scrollend trigger")
            this._render = true;
            if (this._isInstantRenderRequire) {
                this.instantScrollRender(2);
            }
            this.updateRowLabelPos();
            this.updateColLabelPos();
        })
        this.canvaMagnagerElm.style.height = this.height + "px";
        this.canvaMagnagerElm.style.width = this.width + "px";
        this.rowM.numberPerCanva = this.rowsPerCanva;
        this.colM.numberPerCanva = this.colsPerCanva;
        this.rowM.defaultUnit = this.cellHeight;
        this.colM.defaultUnit = this.cellWidth;
        this.instantScrollRender(2);
        this.inputStateM.posX =this.rowLabelCanvaW;
        this.inputStateM.posY =  this.colLabelCanvaH;
        this.inputStateM.canvaObj = this.cnvInst.get( 0, 0 );
        this.inputStateM.setCanvaObj( this.cnvInst.get( 0, 0 ) );
        this.inputStateM.renderHandler = this.handleInputChange.bind(this);
        this.inputStateM.initialize()
        this.inputStateM.render();


        // setting input pos 

        const hideElm = document.getElementById( "hideDiv" );
        hideElm.style.height = this.colLabelCanvaH + "px";
        hideElm.style.width = this.rowLabelCanvaW + "px";

        // this.cnvInst = new CircularBuffer( this.cnvRowUprBnd - this.cnvRowLwrBnd + 1 );
        // // this.cnvRowLabelInst = new CircularBuffer( this.cnvRowUprBnd - this.cnvRowLwrBnd + 1 );
        // // this.cnvColInst = new CircularBuffer( this.cnvColUprBnd - this.cnvColLwrBnd + 1 );
        // this.cnvLabelInst = new CircularBuffer( this.cnvColUprBnd - this.cnvColLwrBnd + 1 );
    }
}


// function DataStorage() {
//     this.cellData = [

//     ];
//     this.rowNumber = 20;
//     this.colNumber = 8;

//     return this;
// }


function getNextColumnLabel(colLabel) {
    let carry = 1;
    let result = '';

    // Process characters from end to start
    for (let i = colLabel.length - 1; i >= 0; i--) {
        const charCode = colLabel.charCodeAt(i) - 65; // 'A' is 65
        const sum = charCode + carry;

        if (sum === 26) {
            result = 'A' + result;
            carry = 1;
        } else {
            result = String.fromCharCode(65 + sum) + result;
            carry = 0;
        }
    }

    // If carry is left after processing all chars, add an 'A' at front
    if (carry === 1) {
        result = 'A' + result;
    }

    return result;
}




const canvaM = new CanvasManager;

canvaM.initialize();
// const dt = DataStorage();
// const canva = new Canva();

// canva._dataStg = dt;

// canva._initialize();
// canva.render();

// canva.render();

