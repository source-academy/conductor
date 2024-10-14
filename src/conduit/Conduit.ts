import Channel from "./Channel";
import { IConduit, ILink, IPlugin, IChannel } from "./types";

export default class Conduit implements IConduit {
    private readonly link: ILink;
    private readonly parent: boolean;
    private readonly channels: Map<string, Channel<any>>;
    private readonly plugins: Map<string, IPlugin>;
    private negotiateChannel(channelName: string): void {
        const { port1, port2 } = new MessageChannel();
        const channel = new Channel(channelName, port1);
        this.link.postMessage([channelName, port2], [port2]); // TODO: update communication protocol?
        this.channels.set(channelName, channel);
    }
    registerPlugin(plugin: IPlugin): void {
        if (plugin.name !== undefined) {
            if (this.plugins.has(plugin.name)) throw Error(`plugin ${plugin.name} already registered`); // TODO: custom error?
            this.plugins.set(plugin.name, plugin);
        }
        const attachedChannels: IChannel<any>[] = [];
        for (const channelName of plugin.channelAttach) {
            if (!this.channels.has(channelName)) this.negotiateChannel(channelName);
            attachedChannels.push(this.channels.get(channelName));
        }
        plugin.init(this, attachedChannels);
    }
    unregisterPlugin(plugin: IPlugin): void {
        // TODO
        plugin.destroy?.();
    }
    lookupPlugin(pluginName: string): IPlugin {
        if (!this.plugins.has(pluginName)) throw Error(`plugin ${pluginName} not registered`); // TODO: custom error?
        return this.plugins.get(pluginName);
    }
    private handlePort(data: [string, MessagePort]) { // TODO: update communication protocol?
        const [channelName, port] = data;
        if (this.channels.has(channelName)) { // uh-oh, we already have a port for this channel
            const channel = this.channels.get(channelName);
            if (this.parent) { // extract the data and discard the messageport; child's Channel will close it
                channel.listenToPort(port);
            } else { // replace our messageport; Channel will close it
                channel.replacePort(port);
            }
        } else { // register the new channel
            const channel = new Channel(channelName, port);
            this.channels.set(channelName, channel);
        }
    }
    constructor(link: ILink, parent: boolean = false) {
        this.link = link;
        link.addEventListener("message", e => this.handlePort(e.data));
        this.parent = parent;
        this.channels = new Map();
        this.plugins = new Map();
    }
}
