


class CnvRcManager {
    constructor(size, defaultValue, offSet) {
        this.size = size;
        this.defaultValue = defaultValue;
        this.offSet = offSet;
        this.values = new Map();  // Sparse: index → newValue
    }

    update(index, newValue) {
        if (newValue === this.defaultValue) {
            this.values.delete(index);
        } else {
            this.values.set(index, newValue);
        }
    }

    getValue(index) {
        return this.values.has(index) ? this.values.get(index) : this.defaultValue;
    }

    getPrefVal(index) {
        let sum = this.offSet + this.defaultValue * index;
        for (let [idx, val] of this.values.entries()) {
            if (idx < index) {
                sum += (val - this.defaultValue);
            }
        }
        return sum;
    }

    // ✅ New method: finds the smallest index such that prefix sum >= targetSum
    findLowerBoundIndex(targetSum) {
        let left = 0;
        let right = this.size;
        let result = this.size;  // default to size if no such index exists

        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            const pref = this.getPrefVal(mid);

            if (pref >= targetSum) {
                result = mid;
                right = mid;
            } else {
                left = mid + 1;
            }
        }

        return result;
    }

    // (Optional: keep this if still needed)
    findClosestIndexToSum(targetSum) {
        let left = 0;
        let right = this.size - 1;
        let closestIndex = -1;
        let closestDiff = Infinity;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const pref = this.getPrefVal(mid);
            const diff = Math.abs(pref - targetSum);

            if (diff < closestDiff) {
                closestDiff = diff;
                closestIndex = mid;
            }

            if (pref < targetSum) {
                left = mid + 1;
            } else if (pref > targetSum) {
                right = mid - 1;
            } else {
                // Exact match
                return mid;
            }
        }

        return closestIndex;
    }
}


export default class RCManager {
    constructor(number, defaultUnit, numberPerCanva, offSet) {
        this.size = number;
        this.defaultUnit = defaultUnit;
        this.numberPerCanva = null;
        this.values = new Map();
        this.offSet = offSet;
        this.cnvdM = new CnvRcManager(Math.ceil(number / numberPerCanva), defaultUnit * numberPerCanva, this.offSet);
    }

    update(index, newValue) {
        if (newValue === this.defaultUnit) {
            let prevValue = this.getValue( index );
            let ind = Math.floor(index / this.numberPerCanva);
            let tmp = this.cnvdM.getValue(ind)
            this.cnvdM.update(ind, tmp + ( newValue - prevValue ));
            
            this.values.delete(index);
        } else {
            let prevValue = this.getValue( index );
            this.values.set(index, newValue);
            let ind = Math.floor(index / this.numberPerCanva);
            let tmp = this.cnvdM.getValue(ind)
            this.cnvdM.update(ind, tmp + ( newValue - prevValue ));
        }
    }
    incre(index, extraValue) {
        let newValue = this.getValue(index) + extraValue;
        if (newValue === this.defaultUnit) {
            this.values.delete(index);
        } else {
            let prevValue = this.getValue( index );
            this.values.set(index, newValue);
            let ind = Math.floor(index / this.numberPerCanva);
            let tmp = this.cnvdM.getValue(ind)
            this.cnvdM.update(ind, tmp + extraValue)
        }
    }

    getValue(index) {
        return this.values.has(index) ? this.values.get(index) : this.defaultUnit;
    }
}