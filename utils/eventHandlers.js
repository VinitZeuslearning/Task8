import BasicMathFuncs from "./basicMathFuncs.js";
import { CellSelectionHandler } from "../handlers/cellSelectionHandler.js";

/**
 * Class which handle the event listners, seletions, resizing and manage the state of the input dom Element  
 * 
 * @param {object} parentContainer - container in which canvas are present
 * @param {object} canvaInstant - dataStrucuter which store the instance of the canva obj
 */
export default class Selectors {
    constructor(parentContainer, canvaInstant) {
        this.parent = parentContainer;
        this.canvaInstant = canvaInstant;
        this.rowLableInstant = null;
        this.colLableInstant = null;
        this.isSelecting = false;
        this.resizingHandler = null;
        this.mainContainer = null;
        this.mainContainerRect = null;
        this.masterHobj = null;
        this.masterWobj = null;
        this.selectionObj = { startRow: 0, startCol: 0, endRow: 0, endCol: 0 };
        this.colLabelSelectionObj = { start: null, end: null }
        this.rowLabelSelectionObj = { start: null, end: null }
        this.totalRow = 100000;
        this.totalCol = 500;
        this.colLabelHeight = 20;
        this.rowLabelWidth = 50;
        this.autoScrollLoopRunning = false;
        this.interactionContext = {
            mode: null, startX: 0, startY: 0, colLabel: null, rowLabel: null, colNumber: null, rowNumber: null, mouseOverState: null
        };

        this.cmdObjState = {
            row: null,
            col: null,
            oldValue: null,
            newVal: null,
            type: null
        }

        this.autoScroll = { left: false, right: false, up: false, down: false };

        this.prevStartCanvaRow = null;
        this.prevEndCanvaRow = null;
        this.prevStartCanvaCol = null;
        this.prevEndCanvaCol = null;
        this.cellDataObj = null;

        this.colNumberPerCanva = 8;
        this.rowNumberPerCanva = 20;

        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.renderAll = null;
        this.renderAllDataCanva = null;
        this.renderAllRowLable = null;
        this.renderAllColLable = null;


        this.scrollCanvaRenderHandler = null;
        this.scrollEndHandler = null;

        this.cmdObj = null;
        this.inputDataObj = { activeInputRow: null, activeInputCol: null };


        this.mouseDownHandlers = new Map();
        this.mouseUpHandlers = new Map();
        this.mouseMoveHandlers = new Map();

        this.currentHandler = null;
    }

    attachListeners() {
        this.parent.addEventListener("mousedown", this.handleMouseDown.bind(this));
        window.addEventListener("mousemove", this.handleMouseMove.bind(this));
        window.addEventListener("mouseup", this.handleMouseUp.bind(this));
        this.mainContainer.addEventListener("scroll", this.handlerParentScroll.bind(this));
        this.mainContainer.addEventListener('scrollend', this.handleEndScroll.bind(this));
    }

    getRelativePos(e) {
        const rect = this.parent.getBoundingClientRect();
        return {
            x: e.clientX + this.parent.scrollLeft - rect.left,
            y: e.clientY + this.parent.scrollTop - rect.top
        };
    }

    getRelativePos(e) {
        const rect = this.parent.getBoundingClientRect();
        return {
            x: e.clientX + this.parent.scrollLeft - rect.left,
            y: e.clientY + this.parent.scrollTop - rect.top
        };
    }

    handleMouseDown(e) {

        // Todo have to do this for all selections features

        for (const elm of this.selectionInstanceArr) {
            if (elm.hitTest(e)) {
                this.currentHandler = elm;
                elm.mouseDownHandler(e);
            }
        }


        this.mouseDown = true;
        this.BasicMathFuncs.clearTempResults();
        const type = e.target.getAttribute('type');
        if (type === 'ColLabel') {
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
        if (type === 'RowLabel') {
            const rowNum = Number(e.target.getAttribute('row'));
            const rowLabel = this.rowLableInstant.get(rowNum);
            const onLine = rowLabel.isOnLine(e.clientX, e.clientY);
            if (onLine !== -1) {
                if (this.interactionContext.mouseOverState == "rowInsert") {
                    this.cellDataObj.shiftRowKeys(onLine);
                    this.renderAllDataCanva();
                }
                else if (this.interactionContext.mouseOverState == "rowResize") {
                    this.cmdObjState.type = 'rowResize';
                    this.cmdObjState.oldValue = this.masterHobj.getValue(onLine - 1);
                    this.cmdObjState.row = onLine - 1;
                    this.interactionContext.mode = 'resize-row';
                    this.interactionContext.startY = e.clientY;
                    this.interactionContext.rowLabel = rowLabel;
                    this.interactionContext.rowNumber = onLine - 1;
                }
            }
            else {
                this.interactionContext.mode = 'rowSelect';
                this.clearColLabelSelection();
                this.clearCellSelection();
                this.rowLabelSelection(e);
            }
        }
    }

    handleMouseMove(e) {

        // Todo have to do this for all selections features
        if (this.currentHandler != null) {
            this.currentHandler.mouseMoveHandler(e);
        }


        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        const elm = document.elementFromPoint(e.clientX, e.clientY);
        const ctx = this.interactionContext;
        const type = elm.getAttribute('type') || "";

        if (ctx.mode === 'resize-row') {
            document.body.style.cursor = 'row-resize';
            const dy = Math.floor(e.clientY - ctx.startY);
            this.cmdObjState.newVal = this.masterHobj.getValue(ctx.rowNumber);
            this.resizingHandler({ canvaRow: ctx.rowLabel.canvaRowNumber, extra: dy, rowNumber: ctx.rowNumber });
            ctx.startY = e.clientY;
            if (this.activeInputRow === ctx.rowNumber)
                this.inputElem.style.height = this.masterHobj.getValue(ctx.rowNumber) + "px";
            this.repositionActiveInput();
        }

        else if (ctx.mode === 'resize-col') {
            document.body.style.cursor = 'col-resize';
            const dx = Math.floor(e.clientX - ctx.startX);
            this.cmdObjState.newVal = this.masterWobj.getValue(ctx.colNumber);
            this.resizingHandler({ canvaCol: ctx.colLabel.canvaColNumber, extra: dx, colNumber: ctx.colNumber });
            ctx.startX = e.clientX;
            if (this.activeInputCol === ctx.colNumber)
                this.inputElem.style.width = this.masterWobj.getValue(ctx.colNumber) + "px";
            this.repositionActiveInput();
        }

        else if (type === "RowLabel" || ctx.mode == "rowSelect") {
            const rowLblElm = document.elementFromPoint(this.mainContainerRect.left + 5, e.clientY);
            if (ctx.mode == "rowSelect") {
                this.rowLabelSelectionMouseMove({ target: rowLblElm, clientX: e.clientX, clientY: e.clientY });
            }
            else {
                const rowNum = Number(elm.getAttribute('row'));
                const rowLabel = this.rowLableInstant.get(rowNum);
                const line = rowLabel.isOnLine(e.clientX, e.clientY);
                if (line != -1) {
                    const posX = this.getRelativePos(e).x;
                    if (posX < this.rowLabelWidth / 2) {
                        document.body.style.cursor = 'crosshair';
                        ctx.mouseOverState = 'rowInsert'
                    }
                    else {
                        document.body.style.cursor = 'row-resize';
                        ctx.mouseOverState = 'rowResize';
                    }
                }
                else {
                    document.body.style.cursor = 'default'
                }
            }
        }

        else if (type === "ColLabel" || ctx.mode == "colSelect") {
            const colLblElm = document.elementFromPoint(e.clientX, this.mainContainerRect.top + 5);
            if (ctx.mode == "colSelect") {
                console.log("colSelect")
                this.columnLabelSelectionMouseMove({ target: colLblElm, clientX: e.clientX, clientY: e.clientY })
            }
            else {
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
                else {
                    document.body.style.cursor = 'default'
                }
            }
        }
        else {
            document.body.style.cursor = 'default'
        }


        if (this.mouseDown && (ctx.mode == 'rowSelect' || ctx.mode == 'colSelect' || ctx.mode == 'cellSelect')) {
            const rect = this.mainContainer.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;
            const bufferX = 100;
            const bufferY = 100;

            this.autoScroll.right = (relX >= rect.width - bufferX);
            this.autoScroll.left = (relX <= bufferX) && (ctx.mode != "rowSelect");
            this.autoScroll.down = (relY >= rect.height - bufferY);
            this.autoScroll.up = (relY <= bufferY) && (ctx.mode != "colSelect");
            // console.log(this.autoScroll)

            if (this.autoScroll.right || this.autoScroll.left || this.autoScroll.up || this.autoScroll.down)
                this.startAutoScroll();
        }

    }

    handlerParentScroll() {
        this.scrollCanvaRenderHandler();
        if (this.interactionContext.mode === 'cellSelect') {
            const syntheticEvent = new MouseEvent("mousemove", {
                clientX: this.lastMouseX,
                clientY: this.lastMouseY,
                bubbles: true
            });
            this.parent.dispatchEvent(syntheticEvent);
        }
    }

    handleEndScroll() {
        this.scrollEndHandler()
    }

    handleMouseUp(e) {

        // Todo have to do this for all selections features
        if ( this.currentHandler != null ) {
            this.currentHandler.mouseUpHandler(e);
            this.currentHandler = null;
        }




        this.isSelecting = false;
        console.log(`under the mosueUP ${JSON.stringify(this.cmdObjState)}`)
        this.mouseDown = false;

        if (this.cmdObjState.type == 'colResize') {
            this.cmdObj.pushResizeColCmd(this.cmdObjState.newVal, this.cmdObjState.oldValue, this.cmdObjState.col);

            this.cmdObjState = {};
        }
        else if (this.cmdObjState.type == 'rowResize') {
            this.cmdObj.pushResizeRowCmd(this.cmdObjState.newVal, this.cmdObjState.oldValue, this.cmdObjState.row);
            this.cmdObjState = {};
        }
        document.body.style.cursor = 'default';
        this.interactionContext = {
            mode: null,
            startX: 0,
            startY: 0,
            colLabel: null,
            rowLabel: null,
            colNumber: null,
            rowNumber: null,
            mouseOverState: null
        };
        this.stopAutoScroll();
    }

    startAutoScroll() {
        if (this.autoScrollLoopRunning) return;
        // console.log("autoScrolled is get called")
        this.autoScrollLoopRunning = true;
        const step = 10;
        const scrollLoop = () => {
            let scrolled = false;
            if (this.autoScroll.right) { this.mainContainer.scrollLeft += step; scrolled = true; }
            if (this.autoScroll.left) { this.mainContainer.scrollLeft -= step; scrolled = true; }
            if (this.autoScroll.down) { this.mainContainer.scrollTop += step; scrolled = true; }
            if (this.autoScroll.up) { this.mainContainer.scrollTop -= step; scrolled = true; }
            if (scrolled) {
                const syntheticEvent = new MouseEvent("mousemove", {
                    clientX: this.lastMouseX,
                    clientY: this.lastMouseY,
                    bubbles: true
                });
                this.parent.dispatchEvent(syntheticEvent);
                this.autoScrollRAF = requestAnimationFrame(scrollLoop);
            } else {
                this.stopAutoScroll();
            }
        };
        this.autoScrollRAF = requestAnimationFrame(scrollLoop);
    }

    commitInputValue() {

        const row = this.activeInputRow;
        const col = this.activeInputCol;
        if (row !== undefined && col !== undefined) {
            const value = this.inputElem.value;
            const existingValue = this.cellDataObj.get(row, col);
            if (value == existingValue) {
                return;
            }
            console.log(`commithign value ${value}`)
            this.cmdObj.pushCellDataCmd(value, existingValue, row, col);
            if (value !== existingValue) {
                this.cellDataObj.set(row, col, value);
            }
        }

    }

    stopAutoScroll() {
        if (this.autoScrollRAF) cancelAnimationFrame(this.autoScrollRAF);
        this.autoScroll = { left: false, right: false, up: false, down: false };
        this.autoScrollLoopRunning = false;
        this.autoScrollRAF = null;
    }

    cellSelection(e) {
        const canvaRow = Number(e.target.getAttribute('row'));
        const canvaCol = Number(e.target.getAttribute('column'));
        const cnvInst = this.canvaInstant.get(canvaRow, canvaCol);
        if (!cnvInst) return;

        const pos = this.getRelativePos(e);
        const cellData = cnvInst.findCell(pos.x, pos.y);
        if (!cellData) return;

        const { posX, posY, row, col } = cellData;
        const rowNumPerCanvas = cnvInst.rowNumber;
        const colNumPerCanvas = cnvInst.colNumber;

        // If inputElem is active — save its current value to cellDataObj before moving

        const prevRow = this.activeInputRow;
        const prevCol = this.activeInputCol;
        const prevValue = this.inputElem.value;

        if (prevRow !== undefined && prevCol !== undefined) {
            this.commitInputValue();
        }


        this.selectionObj.startRow = this.selectionObj.endRow = row;
        this.selectionObj.startCol = this.selectionObj.endCol = col;
        this.renderAllDataCanva();

        // Update previous canvas range
        const canvasRow = Math.floor(row / rowNumPerCanvas);
        const canvasCol = Math.floor(col / colNumPerCanvas);

        this.prevStartCanvaRow = this.prevEndCanvaRow = canvasRow;
        this.prevStartCanvaCol = this.prevEndCanvaCol = canvasCol;

        // cnvInst.render();

        this.activeInputRow = row;
        this.activeInputCol = col;

        this.renderInputElm();
    }

    cellSelectionMouseMove(e) {
        // console.log("selection is continue")
        const canvaRow = Number(e.target.getAttribute('row'));
        const canvaCol = Number(e.target.getAttribute('column'));
        const cnvInst = this.canvaInstant.get(canvaRow, canvaCol);
        if (!cnvInst) return;

        const pos = this.getRelativePos(e);
        const cell = cnvInst.getCellAtPosition(pos.x, pos.y);
        if (!cell) return;

        this.selectionObj.endRow = cell.row;
        this.selectionObj.endCol = cell.col;

        this.renderAllDataCanva();
    }

    columnLabelSelection(e) {
        const canvaCol = Number(e.target.getAttribute('column'));
        const cnvInst = this.colLableInstant.get(canvaCol);
        if (!cnvInst) return;

        const pos = this.getRelativePos(e);
        const colNumber = cnvInst.findCol(pos.x);
        if (colNumber === -1) return;

        // Set start & end to same value on first click

        // Calculate canvas start & end
        const cnvStart = Math.floor(Math.min(this.colLabelSelectionObj.start, this.colLabelSelectionObj.end, colNumber) / this.colNumberPerCanva);
        const cnvEnd = Math.floor(Math.max(this.colLabelSelectionObj.end, this.colLabelSelectionObj.start, colNumber) / this.colNumberPerCanva);

        const start = Math.min(cnvStart, cnvEnd);
        const end = Math.max(cnvStart, cnvEnd);
        this.colLabelSelectionObj.start = colNumber;
        this.colLabelSelectionObj.end = colNumber;
        this.selectionObj.startRow = 0;
        this.selectionObj.endRow = this.totalRow - 1;
        this.selectionObj.startCol = colNumber;
        this.selectionObj.endCol = colNumber;

        this.renderCanvaSelection({ startCol: start, endCol: end })
        for (let i = start; i <= end; i++) {
            const inst = this.colLableInstant.get(i);
            if (inst) inst.render();
        }
    }

    columnLabelSelectionMouseMove(e) {
        const canvaCol = Number(e.target.getAttribute('column'));
        const cnvInst = this.colLableInstant.get(canvaCol);
        if (!cnvInst) return;

        const pos = this.getRelativePos(e);
        const colNumber = cnvInst.findCol(pos.x);
        if (colNumber === -1) return;

        this.colLabelSelectionObj.end = colNumber;


        // Calculate affected canvas indices
        const startCnv = Math.floor(colNumber / this.colNumberPerCanva) - 1;
        const endCnv = Math.floor(colNumber / this.colNumberPerCanva) + 1;
        this.selectionObj.endCol = colNumber;

        this.renderCanvaSelection({ startCol: startCnv, endCol: endCnv })
        // const inst = this.colLableInstant.get(  Math.floor( colNumber / this.colNumberPerCanva ) );
        // inst.render()
        for (let i = startCnv; i <= endCnv; i++) {
            const inst = this.colLableInstant.get(i);
            if (inst) inst.render();
        }
    }

    rowLabelSelection(e) {
        const canvaRow = Number(e.target.getAttribute('row'));
        const cnvInst = this.rowLableInstant.get(canvaRow);
        if (!cnvInst) return;

        const pos = this.getRelativePos(e);
        const rowNumber = cnvInst.findRow(pos.y);
        if (rowNumber === -1) return;

        // Set start & end to same value on first click

        // Calculate canvas start & end
        const cnvStart = Math.floor(Math.min(this.rowLabelSelectionObj.start, this.rowLabelSelectionObj.end, rowNumber) / this.rowNumberPerCanva);
        const cnvEnd = Math.floor(Math.max(this.rowLabelSelectionObj.end, this.rowLabelSelectionObj.start, rowNumber) / this.rowNumberPerCanva);

        const start = Math.min(cnvStart, cnvEnd);
        const end = Math.max(cnvStart, cnvEnd);
        this.rowLabelSelectionObj.start = rowNumber;
        this.rowLabelSelectionObj.end = rowNumber;
        this.selectionObj.startCol = 0;
        this.selectionObj.endCol = this.totalCol - 1;
        this.selectionObj.startRow = rowNumber;
        this.selectionObj.endRow = rowNumber;
        this.renderCanvaSelection({ startRow: start, endRow: end })
        for (let i = start; i <= end; i++) {
            const inst = this.rowLableInstant.get(i);
            if (inst) inst.render();
        }
    }

    rowLabelSelectionMouseMove(e) {
        const canvaRow = Number(e.target.getAttribute('row'));
        const cnvInst = this.rowLableInstant.get(canvaRow);
        if (!cnvInst) return;

        const pos = this.getRelativePos(e);
        const rowNumber = cnvInst.findRow(pos.y);
        if (rowNumber === -1) return;

        this.rowLabelSelectionObj.end = rowNumber;
        this.selectionObj.endRow = rowNumber;

        // Calculate affected canvas indices
        const startCnv = Math.floor(rowNumber / this.rowNumberPerCanva) - 1;
        const endCnv = Math.floor(rowNumber / this.rowNumberPerCanva) + 1;
        console.log(this.rowLabelSelectionObj)

        this.renderCanvaSelection({ startRow: startCnv, endRow: endCnv })
        // const inst = this.colLableInstant.get(  Math.floor( colNumber / this.colNumberPerCanva ) );
        // inst.render()
        for (let i = startCnv; i <= endCnv; i++) {
            const inst = this.rowLableInstant.get(i);
            if (inst) inst.render();
        }
    }

    renderCanvaSelection({ startRow = null, endRow = null, startCol = null, endCol = null }) {
        for (const { id1: row, id2: col, value: instance } of this.canvaInstant.iterate()) {
            const inRowRange = (startRow === null || endRow === null) || (row >= Math.min(startRow, endRow) && row <= Math.max(startRow, endRow));
            const inColRange = (startCol === null || endCol === null) || (col >= Math.min(startCol, endCol) && col <= Math.max(startCol, endCol));

            if (inRowRange && inColRange) {
                instance.render();
            }
        }
    }

    clearRowLabelSelection() {
        // Reset selection object values
        this.rowLabelSelectionObj.start = null;
        this.rowLabelSelectionObj.end = null;

        // Re-render all row label canvases
        this.renderAllRowLable();
    }

    clearColLabelSelection() {
        // Reset selection object values
        this.colLabelSelectionObj.start = null;
        this.colLabelSelectionObj.end = null;

        // Re-render all col label canvases
        this.renderAllColLable()
    }

    clearCellSelection() {
        // Reset main selection object values
        this.selectionObj.startRow = 0;
        this.selectionObj.endRow = 0;
        this.selectionObj.startCol = 0;
        this.selectionObj.endCol = 0;

        // Use your existing rerender method to refresh canvases
        this.renderAllDataCanva();
    }

    initialize() {
        this.BasicMathFuncs = new BasicMathFuncs(this.cellDataObj)
        this.inputElem = document.createElement('input');
        this.inputElem.type = 'text';
        this.inputElem.style.position = 'absolute';
        // this.inputElem.style.display = 'none';
        this.inputElem.style.border = '1px solid #0078d7';
        // this.inputElem.style.outline = 'none';
        this.inputElem.style.fontSize = '12px';
        this.inputElem.style.boxSizing = 'border-box';
        this.inputElem.style.zIndex = 1000;
        this.inputElem.style.textAlign = 'center';

        this.inputElem.id = "newInputElm"

        this.parent.appendChild(this.inputElem);

        // this.inputElem.addEventListener('blur', () => {
        //     this.commitInputValue();
        //     this.inputElem.style.display = 'none';
        // });

        this.inputElem.style.height = 0 + "px"
        this.inputElem.style.width = 0 + "px"
        let debounceTimer;
        this.inputElem.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () {
                this.commitInputValue();
            }.bind(this), 300); // wait 300ms after last keystroke
        });

        const undoElm = document.getElementById('Undo')
        const redoElm = document.getElementById('Redo')

        undoElm.addEventListener('mousedown', function () {
            this.cmdObj.undo();
            this.renderAll();
        }.bind(this))

        redoElm.addEventListener('mousedown', function () {
            this.cmdObj.redo();
            this.renderAll();
        }.bind(this));


        const avgBtn = document.getElementById('average');
        const minBtn = document.getElementById('minimum');
        const maxBtn = document.getElementById('maximum');
        const sumBtn = document.getElementById('sum');

        avgBtn.addEventListener('click', function () {
            this.BasicMathFuncs.avg(this.selectionObj);
            this.renderAllDataCanva();
        }.bind(this))
        minBtn.addEventListener('click', function () {
            this.BasicMathFuncs.min(this.selectionObj);
            this.renderAllDataCanva();
        }.bind(this))

        maxBtn.addEventListener('click', function () {
            this.BasicMathFuncs.max(this.selectionObj);
            this.renderAllDataCanva();
        }.bind(this))

        sumBtn.addEventListener('click', function () {
            this.BasicMathFuncs.sum(this.selectionObj);
            this.renderAllDataCanva();
        }.bind(this))


        // Todo have to do this for all selections features

        this.selectionInstanceArr = [
            new CellSelectionHandler(this.renderAllDataCanva, this.selectionObj, this.renderInputElm.bind(this), this.canvaInstant, this.parent, this.inputDataObj, this.colLabelSelectionObj, this.rowLabelSelectionObj, this.renderAll),
        ];


    }

    repositionActiveInput() {
        // If no active input, skip
        if (this.activeInputRow === undefined || this.activeInputCol === undefined) return;

        this.commitInputValue();
        const row = this.activeInputRow;
        const col = this.activeInputCol;

        // Get the canvas this cell lives in
        const canvaRow = Math.floor(row / 20);
        const canvaCol = Math.floor(col / 8);

        // Compute new top position by adding up heights of rows before `row`
        let top = this.masterHobj.cnvdM.getPrefVal(canvaRow);
        for (let r = 0; r < row; r++) {
            top += this.masterHobj.getValue(r);
        }

        // Compute new left position by adding up widths of cols before `col`
        let left = this.masterWobj.cnvdM.getPrefVal(canvaCol);
        for (let c = 0; c < col; c++) {
            left += this.masterWobj.getValue(c);
        }

        // Set new position and size for input element
        this.inputElem.style.top = `${top}px`;
        this.inputElem.style.left = `${left}px`;
        this.inputElem.style.width = `${this.masterWobj.getValue(col)}px`;
        this.inputElem.style.height = `${this.masterHobj.getValue(row)}px`;
    }

    renderInputElm() {
        let RowInst = this.rowLableInstant.get(Math.floor(this.activeInputRow / this.rowNumberPerCanva));
        let ColInst = this.colLableInstant.get(Math.floor(this.activeInputCol / this.colNumberPerCanva));
        if (!RowInst || !ColInst) {
            return;
        }
        let y = RowInst.getRowPosition(this.activeInputRow)
        let x = ColInst.getColPosition(this.activeInputCol)
        this.inputElem.style.top = y + "px";
        this.inputElem.style.left = x + "px";

        this.inputElem.style.height = this.masterHobj.getValue(this.activeInputRow) + "px";
        this.inputElem.style.width = this.masterWobj.getValue(this.activeInputCol) + "px";

        this.inputElem.value = this.cellDataObj.get(this.activeInputRow, this.activeInputCol)

    }
}
