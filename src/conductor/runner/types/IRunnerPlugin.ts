import { IPlugin } from "../../../conduit";
import { IModulePlugin } from "../../module";
import { Fragment, RunnerStatus } from "../../types";

interface IRunnerPlugin extends IPlugin {
    /**
     * Request a file's contents.
     * @param fileName The name of the file to request.
     * @returns A promise resolving to the content of the requested file.
     */
    requestFile(fileName: string): Promise<string>;

    /**
     * Request the next fragment to run.
     * @returns A promise resolving to the next fragment.
     */
    requestFragment(): Promise<Fragment>;

    /**
     * Request for some input on standard-input.
     * @returns A promise resolving to the input received.
     */
    requestInput(): Promise<string>;

    /**
     * Try to request for some input on standard-input.
     * @returns The input received, or undefined if there is currently no input.
     */
    tryRequestInput(): string | undefined;

    /**
     * Sends a message on standard-output.
     * @param message The output message to send.
     */
    sendOutput(message: string): void;

    /**
     * Sends a message on standard-error.
     * @param message The error message to send.
     */
    sendError(message: string): void;

    /**
     * Provide a status update of the runner.
     * @param status The status to update.
     * @param isActive Is the specified status currently active?
     */
    updateStatus(status: RunnerStatus, isActive: boolean): void;

    /**
     * Registers a plugin with the conduit.
     * @param plugin The plugin to be registered.
     */
    registerPlugin(plugin: IPlugin): void;

    /**
     * Unregister a plugin from the conduit.
     * @param plugin The plugin to be unregistered.
     */
    unregisterPlugin(plugin: IPlugin): void;

    /**
     * Imports a plugin and registers it with the conduit.
     * @param location The path to the plugin file.
     */
    loadPlugin(location: string): Promise<IPlugin>;

    /**
     * Imports a plugin as a module, registers it with the conduit, and links it with the evaluator.
     * @param location The path to the module file.
     */
    loadModule(location: string): Promise<IModulePlugin>;
}

export type { IRunnerPlugin as default };
