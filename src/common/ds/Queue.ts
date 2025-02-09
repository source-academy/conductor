export class Queue<T> {
    private s1!: T[];
    private s2!: T[];
    constructor() {
        this.s1 = [];
        this.s2 = [];
    }
    push(item: T) {
        this.s2.push(item);
    }
    pop(): T {
        if (this.s1.length === 0) {
            if (this.s2.length === 0) throw new Error("queue is empty");
            let temp = this.s1;
            this.s1 = this.s2.reverse();
            this.s2 = temp;
        }
        return this.s1.pop();
    }
    get length() {
        return this.s1.length + this.s2.length;
    }
}
