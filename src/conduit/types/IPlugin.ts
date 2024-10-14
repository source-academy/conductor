import type IChannel from "./IChannel";
import IConduit from "./IConduit";

interface IPlugin {
    /** The name of the plugin. Can be undefined for an unnamed plugin. */
    readonly name?: string;

    /** An array of channel names to be used. */
    readonly channelAttach: string[];

    /**
     * Initialise the plugin.
     * @param channels The requested channels, in the order defined by `channelAttach`.
     */
    init(conduit: IConduit, channels: IChannel<any>[]): void;

    /**
     * Perform any cleanup of the plugin (e.g. closing message queues).
     */
    destroy?(): void;
}

export type { IPlugin as default };
