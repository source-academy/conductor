import type { ConductorError } from "../../../common/errors";
import type { IPlugin } from "../../../conduit";
import type { IModulePlugin } from "../../module";
import type { Chunk, RunnerStatus } from "../../types";

export interface IRunnerPlugin extends IPlugin {
    /**
     * Request a file's contents.
     * @param fileName The name of the file to request.
     * @returns A promise resolving to the content of the requested file.
     */
    requestFile(fileName: string): Promise<string | undefined>;

    /**
     * Request the next chunk to run.
     * @returns A promise resolving to the next chunk.
     */
    requestChunk(): Promise<Chunk>;

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
     * Sends an error.
     * @param error The error to send.
     */
    sendError(error: ConductorError): void;

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
     * Registers an external module with the conduit, and links it with the evaluator.
     * @param module The module to be registered.
     */
    registerModule(module: IModulePlugin): void;

    /**
     * Unregisters an external module from the conduit, and unlinks it from the evaluator.
     * @param module The module to be unregistered.
     */
    unregisterModule(module: IModulePlugin): void;

    /**
     * Imports an external plugin and registers it with the conduit.
     * @param location The location of the external plugin.
     */
    importAndRegisterExternalPlugin(location: string): Promise<IPlugin>;

    /**
     * Imports an external module and registers it with the conduit.
     * @param location The location of the external module.
     */
    importAndRegisterExternalModule(location: string): Promise<IModulePlugin>;
}
