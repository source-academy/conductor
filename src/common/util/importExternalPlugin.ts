import type { IPlugin } from "../../conduit";

/**
 * Imports an external plugin from a given location.
 * @param location Where to find the external plugin.
 * @returns A promise resolving to the imported plugin.
 */
export async function importExternalPlugin(location: string): Promise<IPlugin> {
    const plugin = await import(/* webpackIgnore: true */ location) as IPlugin;
    // TODO: verify it is actually a plugin
    return plugin;
}
