import { IConduit, IMessageQueue, IChannel, MessageQueue, IPlugin } from "../../conduit";
import { IModulePlugin } from "../module";
import InternalChannelName from "../strings/InternalChannelName";
import InternalPluginName from "../strings/InternalPluginName";
import { IFileMessage, Fragment, IServiceMessage, IIOMessage, IStatusMessage, RunnerStatus, IFragmentMessage, serviceMessages } from "../types";
import ServiceMessageType from "../types/ServiceMessageType";
import { IRunnerPlugin, IEvaluator } from "./types";

function serviceHandler(type: ServiceMessageType) {
    return function (originalMethod: (data: IServiceMessage) => void, context: ClassMethodDecoratorContext) {
        context.addInitializer(function () {
            (this as RunnerPlugin).serviceHandlers.set(type, originalMethod.bind(this));
        });
    }
}

export default class RunnerPlugin implements IRunnerPlugin {
    name = InternalPluginName.MAIN;

    private readonly evaluator: IEvaluator;
    private conduit: IConduit;
    private fileQueue: IMessageQueue<IFileMessage>;
    private fragmentQueue: IMessageQueue<IFragmentMessage>;
    private serviceChannel: IChannel<IServiceMessage>;
    private ioQueue: IMessageQueue<IIOMessage>;
    private statusChannel: IChannel<IStatusMessage>;

    readonly serviceHandlers: Map<ServiceMessageType, (message: IServiceMessage) => void>;

    readonly channelAttach = [InternalChannelName.FILE, InternalChannelName.FRAGMENT, InternalChannelName.SERVICE, InternalChannelName.STANDARD_IO, InternalChannelName.STATUS];
    init(conduit: IConduit, [fileChannel, fragmentChannel, serviceChannel, ioChannel, statusChannel]): void {
        this.conduit = conduit;
        this.fileQueue = new MessageQueue(fileChannel);
        this.fragmentQueue = new MessageQueue(fragmentChannel);
        this.serviceChannel = serviceChannel;
        this.ioQueue = new MessageQueue(ioChannel);
        this.statusChannel = statusChannel;

        this.serviceChannel.send(new serviceMessages.Hello());
        this.evaluator.init(this);
    }

    @serviceHandler(ServiceMessageType.HELLO)
    helloServiceHandler(message: serviceMessages.Hello): void {
        console.log(`host is using api version ${message.data.version}`);
    }

    @serviceHandler(ServiceMessageType.ENTRY)
    entryServiceHandler(message: serviceMessages.Entry): void {
        this.evaluator.runEvaluator(message.data);
    }

    async requestFile(fileName: string): Promise<string> {
        this.fileQueue.send({ fileName });
        while (true) {
            const file = await this.fileQueue.receive();
            if (file.fileName === fileName) return file.content;
        }
    }

    async requestFragment(): Promise<Fragment> {
        return (await this.fragmentQueue.receive()).fragment;
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
        this.ioQueue.send({ stream: 1, message });
    }

    sendError(message: string): void {
        this.ioQueue.send({ stream: 2, message });
    }

    updateStatus(status: RunnerStatus, isActive: boolean): void {
        this.statusChannel.send({ status, isActive });
    }

    async loadPlugin(location: string): Promise<IPlugin> {
        const plugin = await import(location) as IPlugin;
        this.conduit.registerPlugin(plugin);
        return plugin;
    }

    async loadModule(location: string) {
        const module = await this.loadPlugin(location) as IModulePlugin;
        if (!module.hook) {
            this.conduit.unregisterPlugin(module);
            throw Error("plugin is not module!");
        }
        module.hook(this.evaluator);
        return module;
    }

    constructor(evaluator: IEvaluator) {
        this.evaluator = evaluator;
        this.serviceHandlers = new Map();
    }
}

