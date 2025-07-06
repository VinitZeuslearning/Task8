export default class BasicMathFuncs {
    constructor(cellDataObj) {
        this.cellDataObj = cellDataObj;
        this.tempResultCells = []; // Track temporary result cells
    }

    // Helper: check if value is number-convertible
    isParsableNumber(value) {
        if (typeof value !== 'string' && typeof value !== 'number') return false;
        value = String(value).trim();
        return value !== '' && !isNaN(Number(value));
    }

    // Helper: normalize selection bounds (so start ≤ end)
    normalizeSelection(obj) {
        const startRow = Math.min(obj.startRow, obj.endRow);
        const endRow = Math.max(obj.startRow, obj.endRow);
        const startCol = Math.min(obj.startCol, obj.endCol);
        const endCol = Math.max(obj.startCol, obj.endCol);
        return { startRow, endRow, startCol, endCol };
    }

    // Helper: get number values from selection
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

    // Helper: find next empty row below selection in a given col
    getNextEmptyRow(startFromRow, col) {
        let row = startFromRow;
        while (this.cellDataObj.has(row, col)) {
            row++;
        }
        return row;
    }

    // Clear any previously placed result cells
    clearTempResults() {
        for (const { row, col } of this.tempResultCells) {
            this.cellDataObj.delete(row, col);
        }
        this.tempResultCells = [];
    }

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
