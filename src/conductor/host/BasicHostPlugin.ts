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

    private conduit: IConduit;
    private fileQueue: IChannelQueue<IFileMessage>;
    private chunkChannel: IChannel<IChunkMessage>;
    private serviceChannel: IChannel<IServiceMessage>;
    private ioQueue: IChannelQueue<IIOMessage>;
    private statusChannel: IChannel<IStatusMessage>;

    private chunkCount: number = 0;

    readonly channelAttach = [InternalChannelName.FILE, InternalChannelName.CHUNK, InternalChannelName.SERVICE, InternalChannelName.STANDARD_IO, InternalChannelName.STATUS];
    init(conduit: IConduit, [fileChannel, chunkChannel, serviceChannel, ioChannel, statusChannel]): void {
        this.conduit = conduit;

        this.fileQueue = new ChannelQueue(fileChannel);
        fileChannel.subscribe(async (fileMessage: IFileMessage) => {
            fileChannel.send({
                content: await this.requestFile(fileMessage.fileName),
                fileName: fileMessage.fileName
            });
        });

        this.chunkChannel = chunkChannel;
        this.serviceChannel = serviceChannel;

        this.ioQueue = new ChannelQueue(ioChannel);
        ioChannel.subscribe((ioMessage: IIOMessage) => this.receiveOutput?.(ioMessage.message));

        this.statusChannel = statusChannel;
        statusChannel.subscribe((statusMessage: IStatusMessage) => {
            this.receiveStatusUpdate?.(statusMessage.status, statusMessage.isActive);
        });

        this.serviceChannel.send(new serviceMessages.Hello());
        this.serviceChannel.subscribe(message => {
            if (this.serviceHandlers.has(message.type)) this.serviceHandlers.get(message.type).call(this, message);
        });
    }

    serviceHandlers = new Map<ServiceMessageType, (message: IServiceMessage) => void>([
        [ServiceMessageType.HELLO, function helloServiceHandler(this: BasicHostPlugin, message: serviceMessages.Hello) {
            if (message.data.version < Constant.PROTOCOL_MIN_VERSION) {
                this.serviceChannel.send(new serviceMessages.Abort(Constant.PROTOCOL_MIN_VERSION));
                console.error(`Runner's protocol version (${message.data.version}) must be at least ${Constant.PROTOCOL_MIN_VERSION}`);
            } else {
                console.log(`Runner is using protocol version ${message.data.version}`);
            }
        }],
        [ServiceMessageType.ABORT, function abortServiceHandler(this: BasicHostPlugin, message: serviceMessages.Abort) {
            console.error(`Runner expects at least protocol version ${message.data.minVersion}, but we are on version ${Constant.PROTOCOL_VERSION}`);
            this.conduit.terminate();
        }]
    ]);

    abstract requestFile(fileName: string): Promise<string | undefined>;

    startEvaluator(entryPoint: string): void {
        this.serviceChannel.send(new serviceMessages.Entry(entryPoint));
    }

    sendChunk(chunk: Chunk): void {
        this.chunkChannel.send({ id: this.chunkCount++, chunk });
    }

    sendInput(message: string): void {
        this.ioQueue.send({ message });
    }

    async requestOutput(): Promise<string> {
        return (await this.ioQueue.receive()).message;
    }

    tryRequestOutput(): string | undefined {
        return this.ioQueue.tryReceive()?.message;
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
        this.conduit.registerPlugin(plugin);
    }

    unregisterPlugin(plugin: IPlugin): void {
        this.conduit.unregisterPlugin(plugin);
    }

    async importAndRegisterExternalPlugin(location: string): Promise<IPlugin> {
        const plugin = await importExternalPlugin(location);
        this.registerPlugin(plugin);
        return plugin;
    }
}
