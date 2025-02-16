import { Constant } from "../../common/Constant";
import type { ConductorError } from "../../common/errors";
import { importExternalPlugin } from "../../common/util";
import { IChannel, IConduit, IPlugin } from "../../conduit";
import { makeRpc } from "../../conduit/rpc";
import { InternalChannelName, InternalPluginName } from "../strings";
import { AbortServiceMessage, Chunk, EntryServiceMessage, HelloServiceMessage, IChunkMessage, IErrorMessage, IIOMessage, IServiceMessage, IStatusMessage, RunnerStatus } from "../types";
import { ServiceMessageType } from "../types";
import { IHostFileRpc, IHostPlugin } from "./types";

export abstract class BasicHostPlugin implements IHostPlugin {
    name = InternalPluginName.HOST_MAIN;

    private __conduit!: IConduit;
    private __chunkChannel!: IChannel<IChunkMessage>;
    private __serviceChannel!: IChannel<IServiceMessage>;
    private __ioChannel!: IChannel<IIOMessage>;

    private readonly __status = new Map<RunnerStatus, boolean>();

    private __chunkCount: number = 0;

    readonly channelAttach = [InternalChannelName.FILE, InternalChannelName.CHUNK, InternalChannelName.SERVICE, InternalChannelName.STANDARD_IO, InternalChannelName.ERROR, InternalChannelName.STATUS];
    init(conduit: IConduit, [fileChannel, chunkChannel, serviceChannel, ioChannel, errorChannel, statusChannel]: IChannel<any>[]): void {
        this.__conduit = conduit;

        makeRpc<IHostFileRpc, {}>(fileChannel, {
            requestFile: this.requestFile.bind(this)
        });

        this.__chunkChannel = chunkChannel;
        this.__serviceChannel = serviceChannel;

        this.__ioChannel = ioChannel;
        ioChannel.subscribe((ioMessage: IIOMessage) => this.receiveOutput?.(ioMessage.message));

        errorChannel.subscribe((errorMessage: IErrorMessage) => this.receiveError?.(errorMessage.error));

        statusChannel.subscribe((statusMessage: IStatusMessage) => {
            const {status, isActive} = statusMessage;
            this.__status.set(status, isActive);
            this.receiveStatusUpdate?.(status, isActive);
        });

        this.__serviceChannel.send(new HelloServiceMessage());
        this.__serviceChannel.subscribe(message => {
            this.__serviceHandlers.get(message.type)?.call(this, message);
        });
    }

    // @ts-expect-error TODO: figure proper way to typecheck this
    private __serviceHandlers = new Map<ServiceMessageType, (message: IServiceMessage) => void>([
        [ServiceMessageType.HELLO, function helloServiceHandler(this: BasicHostPlugin, message: HelloServiceMessage) {
            if (message.data.version < Constant.PROTOCOL_MIN_VERSION) {
                this.__serviceChannel.send(new AbortServiceMessage(Constant.PROTOCOL_MIN_VERSION));
                console.error(`Runner's protocol version (${message.data.version}) must be at least ${Constant.PROTOCOL_MIN_VERSION}`);
            } else {
                console.log(`Runner is using protocol version ${message.data.version}`);
            }
        }],
        [ServiceMessageType.ABORT, function abortServiceHandler(this: BasicHostPlugin, message: AbortServiceMessage) {
            console.error(`Runner expects at least protocol version ${message.data.minVersion}, but we are on version ${Constant.PROTOCOL_VERSION}`);
            this.__conduit.terminate();
        }]
    ]);

    abstract requestFile(fileName: string): Promise<string | undefined>;

    startEvaluator(entryPoint: string): void {
        this.__serviceChannel.send(new EntryServiceMessage(entryPoint));
    }

    sendChunk(chunk: Chunk): void {
        this.__chunkChannel.send({ id: this.__chunkCount++, chunk });
    }

    sendInput(message: string): void {
        this.__ioChannel.send({ message });
    }

    receiveOutput?(message: string): void;

    receiveError?(message: ConductorError): void;

    isStatusActive(status: RunnerStatus): boolean {
        return this.__status.get(status) ?? false;
    }

    receiveStatusUpdate?(status: RunnerStatus, isActive: boolean): void;

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
