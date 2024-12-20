import { IEvaluator, IRunnerPlugin, RunnerPlugin } from "..";
import { Conduit, IConduit, ILink } from "../../../conduit";

/**
 * Initialise this runner with the evaluator to be used.
 * @param evaluator The Evaluator to be used on this runner.
 * @param link The underlying communication link.
 * @returns The initialised `runnerPlugin` and `conduit`.
 */
export function initialise(evaluator: IEvaluator, link: ILink = self as ILink): { runnerPlugin: IRunnerPlugin, conduit: IConduit } {
    const runnerPlugin = new RunnerPlugin(evaluator);
    const conduit = new Conduit(link, false);
    conduit.registerPlugin(runnerPlugin);
    return { runnerPlugin, conduit };
}
