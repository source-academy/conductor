import MessageQueue from "../../common/ds/MessageQueue";
import { ChannelQueue, IChannel, IChannelQueue, IConduit, IPlugin } from "../../conduit";
import InternalChannelName from "../strings/InternalChannelName";
import InternalPluginName from "../strings/InternalPluginName";
import { Fragment, IFileMessage, IFragmentMessage, IIOMessage, IServiceMessage, IStatusMessage, RunnerStatus, serviceMessages } from "../types";
import ServiceMessageType from "../types/ServiceMessageType";
import { IHostPlugin } from "./types";

export default abstract class BasicHostPlugin implements IHostPlugin {
    name = InternalPluginName.HOST_MAIN;

    private conduit: IConduit;
    private fileQueue: IChannelQueue<IFileMessage>;
    private fragmentChannel: IChannel<IFragmentMessage>;
    private serviceChannel: IChannel<IServiceMessage>;
    private ioChannel: IChannel<IIOMessage>;
    private ioQueues: MessageQueue<IIOMessage>[];
    private statusChannel: IChannel<IStatusMessage>;

    private fragmentCount: number = 0;
    serviceHandlers: Map<ServiceMessageType, (message: IServiceMessage) => void>;

    readonly channelAttach = [InternalChannelName.FILE, InternalChannelName.FRAGMENT, InternalChannelName.SERVICE, InternalChannelName.STANDARD_IO, InternalChannelName.STATUS];
    init(conduit: IConduit, [fileChannel, fragmentChannel, serviceChannel, ioChannel, statusChannel]): void {
        this.conduit = conduit;

        this.fileQueue = new ChannelQueue(fileChannel);
        fileChannel.subscribe(async (fileMessage: IFileMessage) => {
            fileChannel.send({
                content: await this.requestFile(fileMessage.fileName),
                fileName: fileMessage.fileName
            });
        });

        this.fragmentChannel = fragmentChannel;
        this.serviceChannel = serviceChannel;

        this.ioChannel = ioChannel;
        this.ioQueues = [null, new MessageQueue(), new MessageQueue()];
        ioChannel.subscribe((ioMessage: IIOMessage) => {
            this.ioQueues[ioMessage.stream].push(ioMessage);
            if (ioMessage.stream === 1) this.receiveOutput?.(ioMessage.message);
            else if (ioMessage.stream === 2) this.receiveError?.(ioMessage.message);
        });

        this.statusChannel = statusChannel;
        statusChannel.subscribe((statusMessage: IStatusMessage) => {
            this.receiveStatusUpdate?.(statusMessage.status, statusMessage.isActive);
        });

        this.serviceChannel.send(new serviceMessages.Hello());
        this.serviceChannel.subscribe(message => {
            if (this.serviceHandlers.has(message.type)) this.serviceHandlers.get(message.type)(message); // TODO: implement service handlers?
        });
    }

    abstract requestFile(fileName: string): Promise<string>;

    sendFragment(fragment: Fragment): void {
        this.fragmentChannel.send({ id: this.fragmentCount++, fragment });
    }

    sendInput(message: string): void {
        this.ioChannel.send({ stream: 1, message });
    }

    async requestOutput(): Promise<string> {
        return (await this.ioQueues[1].pop()).message;
    }

    tryRequestOutput(): string | undefined {
        return this.ioQueues[1].tryPop()?.message;
    }

    receiveOutput?(message: string): void;

    async requestError(): Promise<string> {
        return (await this.ioQueues[2].pop()).message;
    }

    tryRequestError(): string | undefined {
        return this.ioQueues[2].tryPop()?.message;
    }

    receiveError?(message: string): void;

    receiveStatusUpdate?(status: RunnerStatus, isActive: boolean): void;

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

    constructor() {
        if (!this.serviceHandlers) this.serviceHandlers = new Map();
    }
}
