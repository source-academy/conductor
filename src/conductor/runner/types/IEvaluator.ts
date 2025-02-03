import { IRunnerPlugin } from "./IRunnerPlugin";

export interface IEvaluator {
    readonly hasDataInterface?: boolean;

    init(runnerPlugin: IRunnerPlugin): void;
    runEvaluator(entryPoint: string): Promise<any>;
}
