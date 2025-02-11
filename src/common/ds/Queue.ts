export class Queue<T> {
    private __s1: T[] = [];
    private __s2: T[] = [];
    push(item: T) {
        this.__s2.push(item);
    }
    pop(): T {
        if (this.__s1.length === 0) {
            if (this.__s2.length === 0) throw new Error("queue is empty");
            let temp = this.__s1;
            this.__s1 = this.__s2.reverse();
            this.__s2 = temp;
        }
        return this.__s1.pop();
    }
    get length() {
        return this.__s1.length + this.__s2.length;
    }
}
