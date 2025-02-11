import { Constant } from "../../common/Constant";
import { ConductorInternalError } from "../../common/errors/ConductorInternalError";
import { importExternalPlugin } from "../../common/util";
import { ChannelQueue, IChannel, IChannelQueue, IConduit, IPlugin } from "../../conduit";
import { InternalChannelName, InternalPluginName } from "../strings";
import { Chunk, IChunkMessage, IFileMessage, IIOMessage, IServiceMessage, IStatusMessage, RunnerStatus, serviceMessages } from "../types";
import { ServiceMessageType } from "../types";
import type { IHostPlugin } from "./types";

export abstract class BasicHostPlugin implements IHostPlugin {
    name = InternalPluginName.HOST_MAIN;

    private __conduit: IConduit;
    private __fileQueue: IChannelQueue<IFileMessage>;
    private __chunkChannel: IChannel<IChunkMessage>;
    private __serviceChannel: IChannel<IServiceMessage>;
    private __ioQueue: IChannelQueue<IIOMessage>;
    private __statusChannel: IChannel<IStatusMessage>;

    private __chunkCount: number = 0;

    readonly channelAttach = [InternalChannelName.FILE, InternalChannelName.CHUNK, InternalChannelName.SERVICE, InternalChannelName.STANDARD_IO, InternalChannelName.STATUS];
    init(conduit: IConduit, [fileChannel, chunkChannel, serviceChannel, ioChannel, statusChannel]): void {
        this.__conduit = conduit;

        this.__fileQueue = new ChannelQueue(fileChannel);
        fileChannel.subscribe(async (fileMessage: IFileMessage) => {
            fileChannel.send({
                content: await this.requestFile(fileMessage.fileName),
                fileName: fileMessage.fileName
            });
        });

        this.__chunkChannel = chunkChannel;
        this.__serviceChannel = serviceChannel;

        this.__ioQueue = new ChannelQueue(ioChannel);
        ioChannel.subscribe((ioMessage: IIOMessage) => this.receiveOutput?.(ioMessage.message));

        this.__statusChannel = statusChannel;
        statusChannel.subscribe((statusMessage: IStatusMessage) => {
            this.receiveStatusUpdate?.(statusMessage.status, statusMessage.isActive);
        });

        this.__serviceChannel.send(new serviceMessages.Hello());
        this.__serviceChannel.subscribe(message => {
            if (this.__serviceHandlers.has(message.type)) this.__serviceHandlers.get(message.type).call(this, message);
        });
    }

    private __serviceHandlers = new Map<ServiceMessageType, (message: IServiceMessage) => void>([
        [ServiceMessageType.HELLO, function helloServiceHandler(this: BasicHostPlugin, message: serviceMessages.Hello) {
            if (message.data.version < Constant.PROTOCOL_MIN_VERSION) {
                this.__serviceChannel.send(new serviceMessages.Abort(Constant.PROTOCOL_MIN_VERSION));
                console.error(`Runner's protocol version (${message.data.version}) must be at least ${Constant.PROTOCOL_MIN_VERSION}`);
            } else {
                console.log(`Runner is using protocol version ${message.data.version}`);
            }
        }],
        [ServiceMessageType.ABORT, function abortServiceHandler(this: BasicHostPlugin, message: serviceMessages.Abort) {
            console.error(`Runner expects at least protocol version ${message.data.minVersion}, but we are on version ${Constant.PROTOCOL_VERSION}`);
            this.__conduit.terminate();
        }]
    ]);

    abstract requestFile(fileName: string): Promise<string | undefined>;

    startEvaluator(entryPoint: string): void {
        this.__serviceChannel.send(new serviceMessages.Entry(entryPoint));
    }

    sendChunk(chunk: Chunk): void {
        this.__chunkChannel.send({ id: this.__chunkCount++, chunk });
    }

    sendInput(message: string): void {
        this.__ioQueue.send({ message });
    }

    async requestOutput(): Promise<string> {
        return (await this.__ioQueue.receive()).message;
    }

    tryRequestOutput(): string | undefined {
        return this.__ioQueue.tryReceive()?.message;
    }

    receiveOutput?(message: string): void;

    async requestError(): Promise<string> { // TODO: separate error channel
        throw new ConductorInternalError("unimplemented");
    }

    tryRequestError(): string | undefined { // TODO: separate error channel
        throw new ConductorInternalError("unimplemented");
    }

    receiveError?(message: string): void; // TODO: separate error channel

    receiveStatusUpdate?(status: RunnerStatus, isActive: boolean): void; // TODO: hook up to channel

    registerPlugin(plugin: IPlugin): void {
        this.__conduit.registerPlugin(plugin);
    }

    unregisterPlugin(plugin: IPlugin): void {
        this.__conduit.unregisterPlugin(plugin);
    }

    async importAndRegisterExternalPlugin(location: string): Promise<IPlugin> {
        const plugin = await importExternalPlugin(location);
        this.registerPlugin(plugin);
        return plugin;
    }
}
