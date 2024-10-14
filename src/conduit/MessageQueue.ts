import Queue from "../common/ds/Queue";
import { IMessageQueue, IChannel, Subscriber } from "./types";

export default class MessageQueue<T> implements IMessageQueue<T> {
    readonly name: string;
    private channel: IChannel<T>;
    private subscriber: Subscriber<T>;
    private readonly inputQueue: Queue<T>;
    private readonly inputWaitQueue: Queue<Function>;
    async receive(): Promise<T> {
        if (this.inputQueue.length !== 0) return this.inputQueue.pop();
        return new Promise((resolve, reject) => {
            this.inputWaitQueue.push(resolve);
        });
    }
    tryReceive(): T | undefined {
        if (this.inputQueue.length !== 0) return this.inputQueue.pop();
        return undefined;
    }
    send(message: T, transfer?: Transferable[]): void {
        this.channel.send(message, transfer);
    }
    close(): void {
        this.channel.unsubscribe(this.subscriber);
    }
    handleMessage(data: T): void {
        if (this.inputWaitQueue.length !== 0) this.inputWaitQueue.pop()(data);
        else this.inputQueue.push(data);
    }
    constructor(channel: IChannel<T>) {
        this.name = channel.name;
        this.channel = channel;
        this.subscriber = data => this.handleMessage(data);
        this.channel.subscribe(this.subscriber);
        this.inputQueue = new Queue();
        this.inputWaitQueue = new Queue();
    }
}
