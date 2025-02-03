import { IConduit, IChannelQueue, IChannel, ChannelQueue, IPlugin } from "../../conduit";
import { IModulePlugin } from "../module";
import { InternalChannelName, InternalPluginName } from "../strings";
import { Chunk, IChunkMessage, IFileMessage, IServiceMessage, IIOMessage, IStatusMessage, RunnerStatus, serviceMessages, ServiceMessageType } from "../types";
import { IRunnerPlugin, IEvaluator, IInterfacableEvaluator } from "./types";

export class RunnerPlugin implements IRunnerPlugin {
    name = InternalPluginName.RUNNER_MAIN;

    private readonly evaluator: IEvaluator | IInterfacableEvaluator;
    private conduit: IConduit;
    private fileQueue: IChannelQueue<IFileMessage>;
    private chunkQueue: IChannelQueue<IChunkMessage>;
    private serviceChannel: IChannel<IServiceMessage>;
    private ioQueue: IChannelQueue<IIOMessage>;
    private statusChannel: IChannel<IStatusMessage>;

    readonly channelAttach = [InternalChannelName.FILE, InternalChannelName.CHUNK, InternalChannelName.SERVICE, InternalChannelName.STANDARD_IO, InternalChannelName.STATUS];
    init(conduit: IConduit, [fileChannel, chunkChannel, serviceChannel, ioChannel, statusChannel]): void {
        this.conduit = conduit;
        this.fileQueue = new ChannelQueue(fileChannel);
        this.chunkQueue = new ChannelQueue(chunkChannel);
        this.serviceChannel = serviceChannel;
        this.ioQueue = new ChannelQueue(ioChannel);
        this.statusChannel = statusChannel;

        this.serviceChannel.send(new serviceMessages.Hello());
        this.serviceChannel.subscribe(message => {
            if (this.serviceHandlers.has(message.type)) this.serviceHandlers.get(message.type).call(this, message);
        });
        this.evaluator.init(this);
    }

    serviceHandlers = new Map<ServiceMessageType, (message: IServiceMessage) => void>([
        [ServiceMessageType.HELLO, function (message: serviceMessages.Hello) {
            console.log(`host is using api version ${message.data.version}`);
        }],
        [ServiceMessageType.ENTRY, function (message: serviceMessages.Entry) {
            this.evaluator.runEvaluator(message.data);
        }]
    ]);

    async requestFile(fileName: string): Promise<string> {
        this.fileQueue.send({ fileName });
        while (true) {
            const file = await this.fileQueue.receive();
            if (file.fileName === fileName) return file.content;
        }
    }

    async requestChunk(): Promise<Chunk> {
        return (await this.chunkQueue.receive()).chunk;
    }

    async requestInput(): Promise<string> {
        const { message } = await this.ioQueue.receive();
        return message;
    }

    tryRequestInput(): string | undefined {
        const out = this.ioQueue.tryReceive();
        return out?.message;
    }

    sendOutput(message: string): void {
        this.ioQueue.send({ message });
    }

    sendError(message: string): void { // TODO: separate error channel
        throw Error("unimplemented");
    }

    updateStatus(status: RunnerStatus, isActive: boolean): void {
        this.statusChannel.send({ status, isActive });
    }

    registerPlugin(plugin: IPlugin): void {
        this.conduit.registerPlugin(plugin);
    }

    unregisterPlugin(plugin: IPlugin): void {
        this.conduit.unregisterPlugin(plugin);
    }

    async loadPlugin(location: string): Promise<IPlugin> {
        const plugin = await import(location) as IPlugin;
        this.registerPlugin(plugin);
        return plugin;
    }

    async loadModule(location: string) {
        if (!this.evaluator.hasDataInterface) throw Error("Evaluator has no data interface");
        const module = await this.loadPlugin(location) as IModulePlugin;
        if (!module.hook) {
            this.unregisterPlugin(module);
            throw Error("plugin is not module!");
        }
        module.hook(this.evaluator as IInterfacableEvaluator);
        return module;
    }

    constructor(evaluator: IEvaluator | IInterfacableEvaluator) {
        this.evaluator = evaluator;
    }
}
