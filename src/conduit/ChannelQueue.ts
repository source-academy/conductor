import { MessageQueue } from "../common/ds";
import { IChannelQueue, IChannel } from "./types";

export class ChannelQueue<T> implements IChannelQueue<T> {
    readonly name: string;
    private channel: IChannel<T>;
    private messageQueue: MessageQueue<T> = new MessageQueue();

    async receive(): Promise<T> {
        return this.messageQueue.pop();
    }
    tryReceive(): T | undefined {
        return this.messageQueue.tryPop();
    }
    send(message: T, transfer?: Transferable[]): void {
        this.channel.send(message, transfer);
    }
    close(): void {
        this.channel.unsubscribe(this.messageQueue.push);
    }
    constructor(channel: IChannel<T>) {
        this.name = channel.name;
        this.channel = channel;
        this.channel.subscribe(this.messageQueue.push);
    }
}
