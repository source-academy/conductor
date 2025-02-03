import { Queue } from "./Queue";

export class MessageQueue<T> {
    private readonly inputQueue: Queue<T> = new Queue();
    private readonly promiseQueue: Queue<Function> = new Queue();

    push(item: T) {
        if (this.promiseQueue.length !== 0) this.promiseQueue.pop()(item);
        else this.inputQueue.push(item);
    }

    async pop(): Promise<T> {
        if (this.inputQueue.length !== 0) return this.inputQueue.pop();
        return new Promise((resolve, _reject) => {
            this.promiseQueue.push(resolve);
        });
    }

    tryPop(): T | undefined {
        if (this.inputQueue.length !== 0) return this.inputQueue.pop();
        return undefined;
    }

    constructor() {
        this.push = this.push.bind(this);
    }
}
