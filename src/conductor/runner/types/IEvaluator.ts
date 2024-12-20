import { IDataHandler } from "../../types";
import IRunnerPlugin from "./IRunnerPlugin";

interface IEvaluator extends IDataHandler {
    init(runnerPlugin: IRunnerPlugin): void;
    runEvaluator(entryPoint: string): Promise<any>;
}

export type { IEvaluator as default };
