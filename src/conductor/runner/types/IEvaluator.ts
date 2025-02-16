import type { IRunnerPlugin } from "./IRunnerPlugin";

/**
 * The IEvaluator interface exposes methods used by Conductor to interact with evaluators.
 */
export interface IEvaluator {
    /**
     * Initialises this evaluator.
     * @param runnerPlugin The runner plugin attaching to this evaluator.
     */
    init(runnerPlugin: IRunnerPlugin): void;

    /**
     * Starts this evaluator.
     * @param entryPoint The entry point file to start running from.
     * @returns A promise that resolves when the evaluator has terminated.
     */
    startEvaluator(entryPoint: string): Promise<any>;
}
