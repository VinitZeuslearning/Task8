export default class CnvRcManager {
  constructor(size, defaultValue) {
    this.size = size;
    this.defaultValue = defaultValue;
    this.values = new Map();           // Sparse storage
    this.prefixSum = new Array(size);
    this.prefixSum[ 0 ] = this.defaultValue;
    this.rebuildPrefixSum();
  }

  rebuildPrefixSum() {
    this.prefixSum[0] = this.getValue(0);
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
    for (let i = index; i < this.size; i++) {
      if (i === 0) this.prefixSum[i] = this.getValue(i);
      else this.prefixSum[i] = this.prefixSum[i - 1] + this.getValue(i);
    }
  }

  getValue(index) {
    return this.values.has(index) ? this.values.get(index) : this.defaultValue;
  }

  getPrefixSum() {
    return this.prefixSum;
  }

  getPrefVal( index ) {
    this.prefixSum[ index ];
  }

  getSumUpto(index) {
    return this.prefixSum[index];
  }
}
