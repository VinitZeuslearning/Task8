import TwoLevelMap from "./DataStructure/twolevelmap.js";
import RCManager from "./DataStructure/RmCnvManager.js";
import RowLabelCanva from "./Canvas/RowLabelCanva.js";
import ColLabelCanva from "./Canvas/ColLabelCanva.js";
import CellData from "./DataStructure/CellData.js";
import Canva from "./Canvas/DataCanvas.js";
import Selectors from "./utils/eventHandlers.js";
import CommandObj from "./utils/commandObj.js";


/**
 * @param
 */

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
        this.hiddenDivElm = document.getElementById('hideDiv');
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

        this.cellDataObj = new CellData()

        this.Selectors = new Selectors(this.viewPort, this.cnvInst);
        this.Selectors.masterHobj = this.rowM;
        this.Selectors.masterWobj = this.colM;
        this.Selectors.cellDataObj = this.cellDataObj;
        this.Selectors.rowLableInstant = this.rowCnvLabelInst
        this.Selectors.colLableInstant = this.colCnvLabelInst
        this.Selectors.resizingHandler = this.resizingHandler.bind(this);
        this.Selectors.mainContainer = this.viewPort
        this.Selectors.scrollCanvaRenderHandler = this.scrollHandler.bind(this);
        this.Selectors.scrollEndHandler = this.scrollEndHandler.bind(this);
        this.Selectors.mainContainerRect = this.viewPortRect;
        this.Selectors.renderAll = this.renderAll.bind(this);
        this.Selectors.renderAllDataCanva = this.renderAllDataCanva.bind(this);
        this.Selectors.renderAllRowLable = this.renderAllRowLable.bind( this );
        this.Selectors.renderAllColLable = this.renderAllColLable.bind( this );

        // commandObj instance which handle the undo and redo
        this.cmdObj = new CommandObj(this.cellDataObj, this.rowM, this.colM);
        this.Selectors.cmdObj = this.cmdObj;
        this.Selectors.initialize();
    }

    resizingHandler(obj) {
        let tmp;
        let i;
        let j;
        if ( obj.extra > 2 ) {
            console.log("")
        }
        
        if (obj.canvaRow != undefined) {

            // tmp = this.rowM.cnvdM.getValue(obj.row)
            // this.rowM.cnvdM.update(obj.row, tmp + obj.extra);


            // this will auto update the canva prefix and size
            let row = obj.rowNumber;
            tmp = this.rowM.getValue(row);
            if (this.rowM.getValue(row) + obj.extra < this.cellHeight) {
                return;
            }
            this.rowM.update(row, obj.extra + this.rowM.getValue( row ) );

            this.renderAll();

            // changing top of every element 
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
            this.colM.update(col, this.colM.getValue( col ) + obj.extra);
            
            this.renderAll();
        }
    }

    renderAll() {
        // Render all cell canvas instances (TwoLevelMap)
        for (const { value: instance } of this.cnvInst.iterate()) {
            instance.render();
        }

        // Render all column label canvases (simple Map)
        for (const [_, colLabelInstance] of this.colCnvLabelInst) {
            colLabelInstance.render();
        }

        // Render all row label canvases (simple Map)
        for (const [_, rowLabelInstance] of this.rowCnvLabelInst) {
            rowLabelInstance.render();
        }

        this.Selectors.renderInputElm();
        
        this.smoothScrollRender( 2 )
    }

    renderAllDataCanva() {
        for (const { value: instance } of this.cnvInst.iterate()) {
            instance.render();
        }
    }

    renderAllColLable( ) {
        for (const [_, colLabelInstance] of this.colCnvLabelInst) {
            colLabelInstance.render();
        }
    }

    renderAllRowLable( ) {
        for (const [_, rowLabelInstance] of this.rowCnvLabelInst) {
            rowLabelInstance.render();
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
        labelElm._canva.setAttribute('type', 'RowLabel')
        labelElm._canva.setAttribute('row', r)
        labelElm.rowMobj = this.rowM;
        labelElm.rowNumber = (r + 1) * this.rowsPerCanva;
        labelElm.slectionObj = this.Selectors.rowLabelSelectionObj;
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
        labelElm._canva.setAttribute('type', 'ColLabel')
        labelElm._canva.setAttribute('column', c)
        labelElm._canva.id = "C" + c;
        labelElm._canva.style.top = this.scrollTop + "px";
        labelElm.colMobj = this.colM;
        labelElm.colNumber = (c + 1) * this.colsPerCanva;
        labelElm.slectionObj = this.Selectors.colLabelSelectionObj;
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
        inst._canva.setAttribute('type', "cell")
        inst.cellDataObj = this.cellDataObj;
        inst.resizeHandler = this.instantScrollRender.bind(this);
        inst.selectionObj = this.Selectors.selectionObj;
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

    smoothScrollRender(flage) {
        if (!this._render) {
            this.clearChilds();
            return;
        }
        if (!flage || flage == 2 ) {

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
        }

        if ( flage || flage == 2 ) {
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
        }

    }

    handleInputChange(canvaRow, canvCol) {
        let obj = this.cnvInst.get(canvaRow, canvCol);
        if (obj) {
            obj.render();
        }
    }

    scrollHandler() {
        let dx = Math.abs(this.scrollLeft - this.viewPort.scrollLeft);
        let dy = Math.abs(this.scrollTop - this.viewPort.scrollTop);

        // console.log(`dx: ${dx}, dy: ${dy}`)
        this.scrollTop = this.viewPort.scrollTop;
        this.scrollLeft = this.viewPort.scrollLeft;


        if (dx > 900) {
            console.log();
        }
        if (dx > 0) {
            requestAnimationFrame(this.updateRowLabelPos.bind(this));
        }

        if (dy > 0) {
            requestAnimationFrame(this.updateColLabelPos.bind(this));
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
                requestAnimationFrame( this.smoothScrollRender.bind( this, 0) );
            }
        }

        if (dy > 0) {
            if (dy <= this.horDxForSmthScroll && !this._isInstantRenderRequire) {
                requestAnimationFrame(  this.smoothScrollRender.bind(this, 1) )  
            }
        }


        const canvaMagnagerElmRect = this.canvaMagnagerElm.getBoundingClientRect();
        if (  500 >= canvaMagnagerElmRect.height - this.scrollTop  ) {
            this.canvaMagnagerElm.style.height =  Math.min( this.scrollTop + 2000 , this.height ) + "px";
        }

        if (  500 >= canvaMagnagerElmRect.width -  this.scrollLeft  ) {
            this.canvaMagnagerElm.style.width = Math.min( this.scrollLeft + 2000, this.width ) + "px";
        }


    }

    scrollEndHandler() {
        this._render = true;
        if (this._isInstantRenderRequire) {
            this.instantScrollRender(2);
        }
        this.updateRowLabelPos();
        this.updateColLabelPos();
    }

    initialize() {
        this.canvaMagnagerElm.style.height = 2000 + "px";
        this.canvaMagnagerElm.style.width = 2000 + "px";
        this.rowM.numberPerCanva = this.rowsPerCanva;
        this.colM.numberPerCanva = this.colsPerCanva;
        this.rowM.defaultUnit = this.cellHeight;
        this.colM.defaultUnit = this.cellWidth;
        this.instantScrollRender(2);

        this.Selectors.attachListeners()


        // setting input pos 

        const hideElm = document.getElementById("hideDiv");
        hideElm.style.height = this.colLabelCanvaH + "px";
        hideElm.style.width = this.rowLabelCanvaW + "px";

        // this.cnvInst = new CircularBuffer( this.cnvRowUprBnd - this.cnvRowLwrBnd + 1 );
        // // this.cnvRowLabelInst = new CircularBuffer( this.cnvRowUprBnd - this.cnvRowLwrBnd + 1 );
        // // this.cnvColInst = new CircularBuffer( this.cnvColUprBnd - this.cnvColLwrBnd + 1 );
        // this.cnvLabelInst = new CircularBuffer( this.cnvColUprBnd - this.cnvColLwrBnd + 1 );


        document.getElementById("jsonFileInput").addEventListener("change", (e) => {
            this.handleJsonFileUpload(e);
        });

        const fileInput = document.getElementById("jsonFileInput");
        const uploadBtn = document.getElementById("uploadBtn");

        uploadBtn.addEventListener("click", () => {
            fileInput.click();
        });

    }

    handleJsonFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const jsonArray = JSON.parse(e.target.result);
                if (!Array.isArray(jsonArray)) {
                    console.error("Invalid JSON: Expected an array of objects.");
                    return;
                }

                this.loadJsonToCellData(jsonArray, this.cellDataObj);
                console.log("Data loaded successfully");
            } catch (err) {
                console.error("Error parsing JSON:", err);
            }
        }.bind(this);

        reader.readAsText(file);
    }

    loadJsonToCellData(jsonArray, cellDataObj) {
        if (jsonArray.length === 0) return;

        // Extract keys from first object
        const keys = Object.keys(jsonArray[0]);

        // Set header row (row 0)
        keys.forEach((key, colIndex) => {
            this.cellDataObj.set(0, colIndex, key);
        });

        // Set each row of values (starting from row 1)
        jsonArray.forEach((item, rowIndex) => {
            const dataRow = rowIndex + 1;  // row 1, 2, 3...
            keys.forEach((key, colIndex) => {
                this.cellDataObj.set(dataRow, colIndex, `${item[key]}`);
            });
        });

        this.renderAll()
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

