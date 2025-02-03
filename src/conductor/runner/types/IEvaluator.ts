import IRunnerPlugin from "./IRunnerPlugin";

interface IEvaluator {
    readonly hasDataInterface?: boolean;

    init(runnerPlugin: IRunnerPlugin): void;
    runEvaluator(entryPoint: string): Promise<any>;
}

export type { IEvaluator as default };
