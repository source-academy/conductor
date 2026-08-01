import { ConductorInternalError } from "../../common/errors";
import { checkIsPluginClass, type IConduit, type IChannel } from "../../conduit";
import type { IInterfacableEvaluator } from "../runner";
import type { DataType, IDataHandler, ExternCallable, IFunctionSignature, TypedValue } from "../types";
import type { IModulePlugin, IModuleExport } from "./types";

/** An `ExternCallable` that may additionally carry a `.sync` escape hatch: a plain
 * function computing the same result with no Promise/generator indirection at all.
 * `IDataHandler.closure_call_sync` (implemented per-evaluator, e.g. py-slang's
 * `GenericDataHandler`) looks for this on any registered closure - module-exported
 * or cadet-authored alike, since both are registered via the same `closure_make`
 * call - and uses it to skip the mandatory async-generator shape entirely. A module
 * method should only set `.sync` when it can prove the call never needs a real host
 * round-trip (e.g. a pure read/write against an in-memory buffer). */
type SyncCallable<Arg extends readonly DataType[], Ret extends DataType> = ExternCallable<Arg, Ret> & {
    signature?: IFunctionSignature<Arg, Ret>;
    sync?: (...args: TypedValue<DataType>[]) => TypedValue<DataType> | undefined;
};

@checkIsPluginClass
export abstract class BaseModulePlugin implements IModulePlugin {
    abstract id: string;
    readonly exports: IModuleExport[] = [];
    readonly exportedNames: readonly (keyof this)[] = [];
    private __initialisation: Promise<void> | undefined;

    readonly evaluator: IDataHandler;

    static readonly channelAttach: string[];
    constructor(_conduit: IConduit, _channels: IChannel<any>[], evaluator: IInterfacableEvaluator) {
        this.evaluator = evaluator;
    }

    initialise(): Promise<void> {
        this.__initialisation ??= this.__initialise();
        return this.__initialisation;
    }

    private async __initialise(): Promise<void> {
        for (const name of this.exportedNames) {
            const m = this[name] as SyncCallable<any, any>;
            if (!m.signature || typeof m !== "function" || typeof name !== "string") throw new ConductorInternalError(`'${String(name)}' is not an exportable method`);
            // Evaluators invoke the registered closure as a bare function (e.g.
            // `closure.func(...args)`), so `m` must be bound to this instance here —
            // otherwise `this` inside the method body is undefined the moment it's called.
            const boundMethod = m.bind(this) as typeof m;
            boundMethod.signature = m.signature;
            // `Function.prototype.bind` only copies the call behaviour, not arbitrary
            // properties - an optional `.sync` twin (see SyncCallable above) needs the
            // same explicit carry-over `.signature` already gets, and the same `bind`
            // treatment, since it may equally reference `this`. Without this, a
            // module's `.sync` fast path would be silently dropped here before
            // `closure_make` ever sees it, defeating `closure_call_sync` for module
            // methods specifically (cadet-authored closures given to a module are
            // unaffected - they're never routed through this rebind).
            if (m.sync) boundMethod.sync = m.sync.bind(this);
            const c = await this.evaluator.closure_make(m.signature, boundMethod);
            this.exports.push({
                symbol: name,
                value: c,
                signature: m.signature
            });
        }
    }
}
