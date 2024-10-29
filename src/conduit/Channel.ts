import { IChannel, Subscriber } from "./types";

export default class Channel<T> implements IChannel<T> {
    readonly name: string;

    /** The underlying MessagePort of this Channel. */
    private port: MessagePort;

    /** The callbacks subscribed to this Channel. */
    private readonly subscribers: Set<Subscriber<T>> = new Set(); // TODO: use WeakRef? but callbacks tend to be thrown away and leaking is better than incorrect behaviour

    /** Is the Channel allowed to be used? */
    private isAlive: boolean = true;

    send(message: T, transfer?: Transferable[]): void {
        this.checkIsAlive();
        this.port.postMessage(message, transfer);
    }
    subscribe(subscriber: Subscriber<T>): void {
        this.checkIsAlive();
        this.subscribers.add(subscriber);
    }
    unsubscribe(subscriber: Subscriber<T>): void {
        this.checkIsAlive();
        this.subscribers.delete(subscriber);
    }
    close(): void {
        this.checkIsAlive();
        this.isAlive = false;
        this.port?.close();
    }

    /**
     * Check if this Channel is allowed to be used.
     * @throws Throws an error if the Channel has been closed.
     */
    private checkIsAlive() {
        if (!this.isAlive) throw Error(`channel ${name} has been closed!`); // TODO: custom error?
    }

    /**
     * Dispatch some data to subscribers.
     * @param data The data to be dispatched to subscribers.
     */
    private dispatch(data: T): void {
        this.checkIsAlive();
        for (const subscriber of this.subscribers) {
            subscriber(data);
        }
    }

    /**
     * Listens to the port's message event, and starts the port.
     * @param port The MessagePort to listen to.
     */
    listenToPort(port: MessagePort): void {
        port.addEventListener("message", e => this.dispatch(e.data));
        port.start();
    }

    /**
     * Replaces the underlying MessagePort of this Channel and closes it, and starts the new port.
     * @param port The new port to use.
     */
    replacePort(port: MessagePort): void {
        this.checkIsAlive();
        this.port?.close();
        this.port = port;
        this.listenToPort(port);
    }

    constructor(name: string, port: MessagePort) {
        this.name = name;
        this.replacePort(port);
    }
}
