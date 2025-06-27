export default class TwoLevelMap {
    constructor() {
        this.outerMap = new Map();  // id1 → Map(id2 → value)
    }

    insert(id1, id2, value) {
        if (!this.outerMap.has(id1)) {
            this.outerMap.set(id1, new Map());
        }
        this.outerMap.get(id1).set(id2, value);
    }

    delete(id1, id2) {
        if (!this.outerMap.has(id1)) return;

        if (id2 === undefined) {
            // delete entire inner map for id1
            this.outerMap.delete(id1);
        } else {
            const innerMap = this.outerMap.get(id1);
            innerMap.delete(id2);

            // ✅ remove inner map if empty after deletion
            if (innerMap.size === 0) {
                this.outerMap.delete(id1);
            }
        }
    }

    get(id1, id2) {
        if (!this.outerMap.has(id1)) return undefined;
        if (id2 === undefined) return this.outerMap.get(id1);
        return this.outerMap.get(id1).get(id2);
    }

    has(id1, id2) {
        if (!this.outerMap.has(id1)) return false;
        if (id2 === undefined) return true;
        return this.outerMap.get(id1).has(id2);
    }

    clear() {
        this.outerMap.clear();
    }

    *iterate() {
        for (const [id1, innerMap] of this.outerMap) {
            for (const [id2, value] of innerMap) {
                yield { id1, id2, value };
            }
        }
    }

    size() {
        return this.outerMap.size;
    }
}
