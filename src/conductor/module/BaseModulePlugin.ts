import { ConductorInternalError } from "../../common/errors";
import { checkIsPluginClass, IChannel, IConduit } from "../../conduit";
import { IInterfacableEvaluator } from "../runner";
import { ExternCallable, IDataHandler, IFunctionSignature } from "../types";
import { IModulePlugin, IModuleExport } from "./types";

@checkIsPluginClass
export abstract class BaseModulePlugin implements IModulePlugin {
    readonly exports: IModuleExport[] = [];
    readonly exportedNames: readonly (keyof this)[] = [];

    readonly evaluator: IDataHandler;

    static readonly channelAttach: string[];
    constructor(_conduit: IConduit, _channels: IChannel<any>[], evaluator: IInterfacableEvaluator) {
        this.evaluator = evaluator;
    }

    async initialise() {
        for (const name of this.exportedNames) {
            const m = this[name] as ExternCallable<any, any> & {signature?: IFunctionSignature<any, any>};
            if (!m.signature || typeof m !== "function" || typeof name !== "string") throw new ConductorInternalError(`'${String(name)}' is not an exportable method`);
            const c = await this.evaluator.closure_make(m.signature, m);
            this.exports.push({
                symbol: name,
                value: c,
                signature: m.signature
            });
        }
    }
}
