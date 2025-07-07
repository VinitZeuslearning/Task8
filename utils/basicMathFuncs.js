import CellData from "../DataStructure/CellData.js";
/**
 * class which calculate the basic math functions of selected 
 * 
 * @param { CellData } cellDataObj - data strucuter which manage the cell data
 */
export default class BasicMathFuncs {
    constructor(cellDataObj) {
        this.cellDataObj = cellDataObj;
        this.tempResultCells = []; // Track temporary result cells
    }

    /**
     * check if value is number-convertible
     * 
     * @param {any} value 
     * @returns 
     */
    isParsableNumber(value) {
        if (typeof value !== 'string' && typeof value !== 'number') return false;
        value = String(value).trim();
        return value !== '' && !isNaN(Number(value));
    }

    /**
     * 
     * @param {Object} obj - object contain start , end of row and col
     * @returns - normalize order of object in which start less then the end
     */
    normalizeSelection(obj) {
        const startRow = Math.min(obj.startRow, obj.endRow);
        const endRow = Math.max(obj.startRow, obj.endRow);
        const startCol = Math.min(obj.startCol, obj.endCol);
        const endCol = Math.max(obj.startCol, obj.endCol);
        return { startRow, endRow, startCol, endCol };
    }

    /**
     * 
     * @param {Object} obj - object contain start , end of row and col of selected cells
     * @returns - Array contain the numbers
     */
    getValues(obj) {
        const values = [];
        const { startRow, endRow, startCol, endCol } = this.normalizeSelection(obj);

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const value = this.cellDataObj.get(r, c);
                if (this.isParsableNumber(value)) {
                    values.push(Number(value));
                }
            }
        }

        return values;
    }

    /**
     * 
     * @param {Number} startFromRow 
     * @param {Number} col 
     * @returns - available empty row
     */
    getNextEmptyRow(startFromRow, col) {
        let row = startFromRow;
        while (this.cellDataObj.has(row, col)) {
            row++;
        }
        return row;
    }

    /**
     * method which clear the result of the function
     */
    clearTempResults() {
        for (const { row, col } of this.tempResultCells) {
            this.cellDataObj.delete(row, col);
        }
        this.tempResultCells = [];
    }


    /**
     * Calculates the sum of selected cell values and writes the result 
     * to the next empty row below the selection in each selected column.
     *
     * @param {Object} obj - The selection object.
     * @param {number} obj.startRow - The starting row index of the selection.
     * @param {number} obj.endRow - The ending row index of the selection.
     * @param {number} obj.startCol - The starting column index of the selection.
     * @param {number} obj.endCol - The ending column index of the selection.
     */
    sum(obj) {
        this.clearTempResults();
        const { endRow, startCol, endCol } = this.normalizeSelection(obj);

        const values = this.getValues(obj);
        const total = values.reduce((acc, val) => acc + val, 0);

        for (let c = startCol; c <= endCol; c++) {
            const row = this.getNextEmptyRow(endRow + 1, c);
            this.cellDataObj.set(row, c, String(total));
            this.tempResultCells.push({ row, col: c });
        }
    }

    /**
     * Calculates the minimum value from selected cell values and writes the result 
     * to the next empty row below the selection in each selected column.
     *
     * @param {Object} obj - The selection object.
     * @param {number} obj.startRow - The starting row index of the selection.
     * @param {number} obj.endRow - The ending row index of the selection.
     * @param {number} obj.startCol - The starting column index of the selection.
     * @param {number} obj.endCol - The ending column index of the selection.
     */
    min(obj) {
        this.clearTempResults();
        const { endRow, startCol, endCol } = this.normalizeSelection(obj);

        const values = this.getValues(obj);
        if (values.length === 0) return;

        const minValue = Math.min(...values);

        for (let c = startCol; c <= endCol; c++) {
            const row = this.getNextEmptyRow(endRow + 1, c);
            this.cellDataObj.set(row, c, String(minValue));
            this.tempResultCells.push({ row, col: c });
        }
    }

    /**
     * Calculates the maximum value from selected cell values and writes the result 
     * to the next empty row below the selection in each selected column.
     *
     * @param {Object} obj - The selection object.
     * @param {number} obj.startRow - The starting row index of the selection.
     * @param {number} obj.endRow - The ending row index of the selection.
     * @param {number} obj.startCol - The starting column index of the selection.
     * @param {number} obj.endCol - The ending column index of the selection.
     */
    max(obj) {
        this.clearTempResults();
        const { endRow, startCol, endCol } = this.normalizeSelection(obj);

        const values = this.getValues(obj);
        if (values.length === 0) return;

        const maxValue = Math.max(...values);

        for (let c = startCol; c <= endCol; c++) {
            const row = this.getNextEmptyRow(endRow + 1, c);
            this.cellDataObj.set(row, c, String(maxValue));
            this.tempResultCells.push({ row, col: c });
        }
    }

    /**
     * Calculates the average of selected cell values and writes the result 
     * to the next empty row below the selection in each selected column.
     *
     * @param {Object} obj - The selection object.
     * @param {number} obj.startRow - The starting row index of the selection.
     * @param {number} obj.endRow - The ending row index of the selection.
     * @param {number} obj.startCol - The starting column index of the selection.
     * @param {number} obj.endCol - The ending column index of the selection.
     */
    avg(obj) {
        this.clearTempResults();
        const { endRow, startCol, endCol } = this.normalizeSelection(obj);

        const values = this.getValues(obj);
        if (values.length === 0) return;

        const avgValue = values.reduce((acc, val) => acc + val, 0) / values.length;

        for (let c = startCol; c <= endCol; c++) {
            const row = this.getNextEmptyRow(endRow + 1, c);
            this.cellDataObj.set(row, c, String(avgValue));
            this.tempResultCells.push({ row, col: c });
        }
    }

}
