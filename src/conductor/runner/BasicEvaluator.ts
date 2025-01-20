import { Identifier, PairIdentifier, ExternValue, DataType, ArrayIdentifier, IFunctionSignature, ExternCallable, ClosureIdentifier, OpaqueIdentifier } from "../types";
import { IEvaluator, IRunnerPlugin } from "./types";

export default abstract class BasicEvaluator implements IEvaluator {
    conductor: IRunnerPlugin;
    init(conductor: IRunnerPlugin): void {
        this.conductor = conductor;
    }

    async runEvaluator(entryPoint: string): Promise<any> {
        const initialChunk = await this.conductor.requestFile(entryPoint);
        await this.evaluateFile(entryPoint, initialChunk);
        while (true) {
            const chunk = await this.conductor.requestChunk();
            await this.evaluateChunk(chunk);
        }
    }

    async evaluateFile(fileName: string, fileContent: string): Promise<void> {
        return await this.evaluateChunk(fileContent);
    }
    abstract evaluateChunk(chunk: string): Promise<void>;

    abstract pair_make(): Identifier;
    abstract pair_gethead(p: PairIdentifier): ExternValue;
    abstract pair_typehead(p: PairIdentifier): DataType;
    abstract pair_sethead(p: PairIdentifier, t: DataType, v: ExternValue): void;
    abstract pair_gettail(p: PairIdentifier): ExternValue;
    abstract pair_typetail(p: PairIdentifier): DataType;
    abstract pair_settail(p: PairIdentifier, t: DataType, v: ExternValue): void;

    abstract array_make(t: DataType, len: number, init?: ExternValue): Identifier;
    abstract array_get(a: ArrayIdentifier, idx: number): ExternValue;
    abstract array_type(a: ArrayIdentifier): DataType;
    abstract array_set(a: ArrayIdentifier, idx: number, v: ExternValue): void;

    abstract closure_make(sig: IFunctionSignature, func: ExternCallable): Identifier;
    abstract closure_call(c: ClosureIdentifier, args: ExternValue[]): ExternValue;

    abstract opaque_make(v: any): Identifier;
    abstract opaque_get(o: OpaqueIdentifier): any;

    abstract type(i: Identifier): DataType;
    abstract tie(dependent: Identifier, dependee: Identifier): void;
    abstract untie(dependent: Identifier, dependee: Identifier): void;
    // abstract free(i: Identifier): void;
}
