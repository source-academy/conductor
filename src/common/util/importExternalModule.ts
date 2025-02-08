import type { IModulePlugin } from "../../conductor/module";
import { importExternalPlugin } from "./importExternalPlugin";

/**
 * Imports an external module from a given location.
 * @param location Where to find the external module.
 * @returns A promise resolving to the imported module.
 */
export async function importExternalModule(location: string): Promise<IModulePlugin> {
    const plugin = await importExternalPlugin(location) as IModulePlugin;
    if (!plugin.hook) { // TODO: additional verification it is a module
        throw new Error("not a module");
    }
    return plugin;
}
