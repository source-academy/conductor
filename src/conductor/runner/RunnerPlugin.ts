import { Constant } from "../../common/Constant";
import { ConductorInternalError } from "../../common/errors/ConductorInternalError";
import { importExternalPlugin } from "../../common/util";
import { importExternalModule } from "../../common/util/importExternalModule";
import { IConduit, IChannelQueue, IChannel, ChannelQueue, IPlugin } from "../../conduit";
import { IModulePlugin } from "../module";
import { InternalChannelName, InternalPluginName } from "../strings";
import { Chunk, IChunkMessage, IFileMessage, IServiceMessage, IIOMessage, IStatusMessage, RunnerStatus, serviceMessages, ServiceMessageType } from "../types";
import { IRunnerPlugin, IEvaluator, IInterfacableEvaluator } from "./types";

export class RunnerPlugin implements IRunnerPlugin {
    name = InternalPluginName.RUNNER_MAIN;

    private readonly __evaluator: IEvaluator | IInterfacableEvaluator;
    private readonly __isCompatibleWithModules: boolean;
    private __conduit: IConduit;
    private __fileQueue: IChannelQueue<IFileMessage>;
    private __chunkQueue: IChannelQueue<IChunkMessage>;
    private __serviceChannel: IChannel<IServiceMessage>;
    private __ioQueue: IChannelQueue<IIOMessage>;
    private __statusChannel: IChannel<IStatusMessage>;

    readonly channelAttach = [InternalChannelName.FILE, InternalChannelName.CHUNK, InternalChannelName.SERVICE, InternalChannelName.STANDARD_IO, InternalChannelName.STATUS];
    init(conduit: IConduit, [fileChannel, chunkChannel, serviceChannel, ioChannel, statusChannel]): void {
        this.__conduit = conduit;
        this.__fileQueue = new ChannelQueue(fileChannel);
        this.__chunkQueue = new ChannelQueue(chunkChannel);
        this.__serviceChannel = serviceChannel;
        this.__ioQueue = new ChannelQueue(ioChannel);
        this.__statusChannel = statusChannel;

        this.__serviceChannel.send(new serviceMessages.Hello());
        this.__serviceChannel.subscribe(message => {
            if (this.__serviceHandlers.has(message.type)) this.__serviceHandlers.get(message.type).call(this, message);
        });
        this.__evaluator.init(this);
    }

    private __serviceHandlers = new Map<ServiceMessageType, (message: IServiceMessage) => void>([
        [ServiceMessageType.HELLO, function helloServiceHandler(this: RunnerPlugin, message: serviceMessages.Hello) {
            if (message.data.version < Constant.PROTOCOL_MIN_VERSION) {
                this.__serviceChannel.send(new serviceMessages.Abort(Constant.PROTOCOL_MIN_VERSION));
                console.error(`Host's protocol version (${message.data.version}) must be at least ${Constant.PROTOCOL_MIN_VERSION}`);
            } else {
                console.log(`Host is using protocol version ${message.data.version}`);
            }
        }],
        [ServiceMessageType.ABORT, function abortServiceHandler(this: RunnerPlugin, message: serviceMessages.Abort) {
            console.error(`Host expects at least protocol version ${message.data.minVersion}, but we are on version ${Constant.PROTOCOL_VERSION}`);
            this.__conduit.terminate();
        }],
        [ServiceMessageType.ENTRY, function entryServiceHandler(this: RunnerPlugin, message: serviceMessages.Entry) {
            this.__evaluator.startEvaluator(message.data);
        }]
    ]);

    async requestFile(fileName: string): Promise<string> {
        this.__fileQueue.send({ fileName });
        while (true) {
            const file = await this.__fileQueue.receive();
            if (file.fileName === fileName) return file.content;
        }
    }

    async requestChunk(): Promise<Chunk> {
        return (await this.__chunkQueue.receive()).chunk;
    }

    async requestInput(): Promise<string> {
        const { message } = await this.__ioQueue.receive();
        return message;
    }

    tryRequestInput(): string | undefined {
        const out = this.__ioQueue.tryReceive();
        return out?.message;
    }

    sendOutput(message: string): void {
        this.__ioQueue.send({ message });
    }

    sendError(message: string): void { // TODO: separate error channel
        throw new ConductorInternalError("unimplemented");
    }

    updateStatus(status: RunnerStatus, isActive: boolean): void {
        this.__statusChannel.send({ status, isActive });
    }

    registerPlugin(plugin: IPlugin): void {
        this.__conduit.registerPlugin(plugin);
    }

    unregisterPlugin(plugin: IPlugin): void {
        this.__conduit.unregisterPlugin(plugin);
    }

    registerModule(module: IModulePlugin): void {
        if (!this.__isCompatibleWithModules) throw new ConductorInternalError("Evaluator has no data interface");
        this.registerPlugin(module);
        module.hook(this.__evaluator as IInterfacableEvaluator);
    }

    unregisterModule(module: IModulePlugin): void {
        module.unhook();
        this.unregisterPlugin(module);
    }

    async importAndRegisterExternalPlugin(location: string): Promise<IPlugin> {
        const plugin = await importExternalPlugin(location);
        this.registerPlugin(plugin);
        return plugin;
    }

    async importAndRegisterExternalModule(location: string): Promise<IModulePlugin> {
        const module = await importExternalModule(location);
        this.registerModule(module);
        return module;
    }

    constructor(evaluator: IEvaluator | IInterfacableEvaluator) {
        this.__evaluator = evaluator;
        this.__isCompatibleWithModules = (this.__evaluator as IInterfacableEvaluator).hasDataInterface ?? false;
    }
}
