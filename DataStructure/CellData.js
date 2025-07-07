/**
 * Data structure that manages the values of individual cells in a grid-like structure.
 * 
 * Internally uses a nested Map: Map<row, Map<col, value>>.
 */
export default class CellData {
    /**
     * Creates a new CellData instance.
     *
     * @constructor
     */
    constructor() {
        /**
         * Internal storage of cell data.
         * @type {Map<number, Map<number, any>>}
         */
        this.data = new Map();
    }

    /**
     * Sets the value of a specific cell.
     * If the value is undefined, null, or an empty string, the cell is removed.
     *
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     * @param {any} value - The value to set.
     */
    set(row, col, value) {
        if (!this.data.has(row)) {
            this.data.set(row, new Map());
        }
        const rowMap = this.data.get(row);

        if (value === undefined || value === null || value === "") {
            rowMap.delete(col);
            if (rowMap.size === 0) {
                this.data.delete(row);
            }
        } else {
            rowMap.set(col, value);
        }
    }

    /**
     * Retrieves cell values based on provided row and/or column indices.
     *
     * - If both `row` and `col` are provided, returns the value at that cell or an empty string if not found.
     * - If only `row` is provided, returns an object of column-value pairs for that row.
     * - If only `col` is provided, returns an object of row-value pairs for that column.
     * - If neither is provided, returns an empty object.
     *
     * @param {number} [row] - The row index (optional).
     * @param {number} [col] - The column index (optional).
     * @returns {any|Object} The retrieved value(s) based on provided arguments.
     */
    get(row, col) {
        if (typeof row !== 'undefined' && typeof col !== 'undefined') {
            const rowMap = this.data.get(row);
            return rowMap && rowMap.has(col) ? rowMap.get(col) : "";
        }

        if (typeof row !== 'undefined') {
            const rowMap = this.data.get(row);
            return rowMap ? Object.fromEntries(rowMap.entries()) : {};
        }

        if (typeof col !== 'undefined') {
            const result = {};
            for (const [r, rowMap] of this.data.entries()) {
                if (rowMap.has(col)) {
                    result[r] = rowMap.get(col);
                }
            }
            return result;
        }

        return {};
    }

    /**
     * Checks whether a cell exists at the given row and column.
     *
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     * @returns {boolean} True if the cell exists, false otherwise.
     */
    has(row, col) {
        const rowMap = this.data.get(row);
        return rowMap ? rowMap.has(col) : false;
    }

    /**
     * Deletes the value of a specific cell.
     *
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     */
    delete(row, col) {
        this.set(row, col, undefined);
    }

    /**
     * Shifts all row keys greater than or equal to `fromIndex` down by 1.
     * This effectively moves all affected rows one position lower.
     *
     * @param {number} fromIndex - The starting row index to shift.
     */
    shiftRowKeys(fromIndex) {
        const newData = new Map();

        for (const [row, colMap] of this.data.entries()) {
            const newRow = row >= fromIndex ? row + 1 : row;
            newData.set(newRow, colMap);
        }

        this.data = newData;
    }

    /**
     * Shifts all column keys greater than or equal to `fromIndex` right by 1 
     * in every row. This effectively moves all affected columns one position to the right.
     *
     * @param {number} fromIndex - The starting column index to shift.
     */
    shiftColKeys(fromIndex) {
        for (const [row, colMap] of this.data.entries()) {
            const newColMap = new Map();

            for (const [col, value] of colMap.entries()) {
                const newCol = col >= fromIndex ? col + 1 : col;
                newColMap.set(newCol, value);
            }

            this.data.set(row, newColMap);
        }
    }
}
