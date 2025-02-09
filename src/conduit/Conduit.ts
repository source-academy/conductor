import { ConductorInternalError } from "../common/errors/ConductorInternalError";
import { Channel } from "./Channel";
import { IConduit, ILink, IPlugin, IChannel } from "./types";

export class Conduit implements IConduit {
    private alive: boolean = true;
    private readonly link: ILink;
    private readonly parent: boolean;
    private readonly channels: Map<string, Channel<any>> = new Map();
    private readonly pluginMap: Map<string, IPlugin> = new Map();
    private readonly plugins: IPlugin[] = [];
    private negotiateChannel(channelName: string): void {
        const { port1, port2 } = new MessageChannel();
        const channel = new Channel(channelName, port1);
        this.link.postMessage([channelName, port2], [port2]); // TODO: update communication protocol?
        this.channels.set(channelName, channel);
    }
    private verifyAlive() {
        if (!this.alive) throw new ConductorInternalError("conduit terminated");
    }
    registerPlugin(plugin: IPlugin): void {
        this.verifyAlive();
        if (plugin.name !== undefined) {
            if (this.pluginMap.has(plugin.name)) throw new ConductorInternalError(`Plugin ${plugin.name} already registered`);
            this.pluginMap.set(plugin.name, plugin);
        }
        this.plugins.push(plugin);
        const attachedChannels: IChannel<any>[] = [];
        for (const channelName of plugin.channelAttach) {
            if (!this.channels.has(channelName)) this.negotiateChannel(channelName);
            attachedChannels.push(this.channels.get(channelName));
        }
        plugin.init(this, attachedChannels);
    }
    unregisterPlugin(plugin: IPlugin): void {
        this.verifyAlive();
        let p = 0;
        for (let i = 0; i < this.plugins.length; ++i) {
            if (this.plugins[p] === plugin) ++p;
            this.plugins[i] = this.plugins[i + p];
        }
        for (let i = this.plugins.length - 1, e = this.plugins.length - p; i >= e; --i) {
            delete this.plugins[i];
        }
        if (plugin.name) {
            this.pluginMap.delete(plugin.name);
        }
        plugin.destroy?.();
    }
    lookupPlugin(pluginName: string): IPlugin {
        this.verifyAlive();
        if (!this.pluginMap.has(pluginName)) throw new ConductorInternalError(`Plugin ${pluginName} not registered`);
        return this.pluginMap.get(pluginName);
    }
    terminate(): void {
        this.verifyAlive();
        for (const plugin of this.plugins) {
            //this.unregisterPlugin(plugin);
            plugin.destroy?.();
        }
        this.link.terminate?.();
        this.alive = false;
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
    }
}
