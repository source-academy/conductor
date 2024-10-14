import type IPlugin from "./IPlugin";

interface IConduit {
    /**
     * Register a plugin with the conduit.
     * @param plugin The plugin to be registered.
     */
    registerPlugin(plugin: IPlugin): void;

    /**
     * Unregister a plugin from the conduit.
     * @param plugin The plugin to be unregistered.
     */
    unregisterPlugin(plugin: IPlugin): void;

    /**
     * Look for a plugin with the given name.
     * @param pluginName The name of the plugin to be searched for.
     */
    lookupPlugin(pluginName: string): IPlugin;
}

export type { IConduit as default };
