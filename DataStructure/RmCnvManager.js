
class CnvRcManager {
    constructor(size, defaultValue, offSet) {
        this.size = size;
        this.defaultValue = defaultValue;
        this.values = new Map();           // Sparse storage

        this.prefixSum = new Array(size);
        this.prefixSum[ 0 ] = offSet;
        this.rebuildPrefixSum();
    }

    rebuildPrefixSum() {
        for (let i = 1; i < this.size; i++) {
            this.prefixSum[i] = this.prefixSum[i - 1] + this.getValue(i);
        }
    }

    update(index, newValue) {
        if (newValue === this.defaultValue) {
            this.values.delete(index);
        } else {
            this.values.set(index, newValue);
        }

        for (let i = Math.max( index + 1, 1 ) ; i < this.size; i++) {
            this.prefixSum[i] = this.prefixSum[i - 1] + this.getValue(i - 1);
        }
    }

    getValue(index) {
        return this.values.has(index) ? this.values.get(index) : this.defaultValue;
    }

    getPrefixSum() {
        return this.prefixSum;
    }

    getPrefVal(index) {
        return this.prefixSum[index];
    }

    getSumUpto(index) {
        return this.prefixSum[index];
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
            this.values.delete(index);
        } else {
            this.values.set(index, newValue);
            let ind = Math.floor( index / this.numberPerCanva );
            let tmp = this.cnvdM.getValue( ind )
            this.cnvdM.update( ind, tmp + newValue )
        }
    }
    incre(index, extraValue) {
        let newValue = this.getValue( index ) + extraValue;
        if (newValue === this.defaultUnit) {
            this.values.delete(index);
        } else {
            this.values.set(index, newValue);
            let ind = Math.floor( index / this.numberPerCanva );
            let tmp = this.cnvdM.getValue( ind )
            this.cnvdM.update( ind, tmp + extraValue )
        }
    }

    getValue(index) {
        return this.values.has(index) ? this.values.get(index) : this.defaultUnit;
    }
}