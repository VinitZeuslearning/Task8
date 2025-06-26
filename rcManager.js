import CnvRcManager from "./canvaRcManager";

export default class RCManager {
  constructor(number, defaultUnit, numberPerCanva) {
    this.size = number;
    this.defaultUnit = defaultUnit;
    this.numberPerCanva;
    this.values = new Map();
    this.cnvdM = new CnvRcManager(number / numberPerCanva, defaultUnit * numberPerCanva);
  }

  update(index, newValue) {
    if (newValue === this.defaultUnit) {
      this.values.delete(index);
    } else {
      this.values.set(index, newValue);
    }
  }

  getValue(index) {
    return this.values.has(index) ? this.values.get(index) : this.defaultUnit;
  }
}
