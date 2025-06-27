class Node {
  constructor(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

export default class LinkedHashSet {
  constructor() {
    this.map = new Map();  // value → node
    this.head = null;
    this.tail = null;
  }

  insert(value) {
    if (this.map.has(value)) return; // no duplicates
    const node = new Node(value);
    this.map.set(value, node);

    if (!this.head) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
  }

  remove(value) {
    const node = this.map.get(value);
    if (!node) return;

    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;

    if (node === this.head) this.head = node.next;
    if (node === this.tail) this.tail = node.prev;

    this.map.delete(value);
  }

  *iterate() {
    let current = this.head;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }

  has(value) {
    return this.map.has(value);
  }
}
