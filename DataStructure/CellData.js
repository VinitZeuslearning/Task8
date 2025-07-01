export default class CellData {
    constructor() {
        this.data = new Map(); // Map<row, Map<col, value>>
    }

    set(row, col, value) {
        if (!this.data.has(row)) {
            this.data.set(row, new Map());
        }
        const rowMap = this.data.get(row);

        if (value === undefined || value === null || value == "") {
            rowMap.delete(col);
            if (rowMap.size === 0) {
                this.data.delete(row);
            }
        } else {
            rowMap.set(col, value);
        }
    }

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

    has(row, col) {
        const rowMap = this.data.get(row);
        return rowMap ? rowMap.has(col) : false;
    }

    delete(row, col) {
        this.set(row, col, undefined);
    }
}
