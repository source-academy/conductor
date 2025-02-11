import { EvaluatorTypeError } from "../../common/errors";
import { ConductorInternalError } from "../../common/errors/ConductorInternalError";
import { IConduit, IChannel } from "../../conduit";
import { InternalChannelName } from "../strings";
import { IDataHandler, PairIdentifier, ExternValue, DataType, ArrayIdentifier, IFunctionSignature, ExternCallable, ClosureIdentifier, Identifier, OpaqueIdentifier, ReturnValue, ExternTypeOf } from "../types";
import { isSameType } from "../util";
import { IModulePlugin, IModuleExport } from "./types";

const methods: readonly (Exclude<keyof IDataHandler, "hasDataInterface">)[] = [
    "pair_make", "pair_gethead", "pair_typehead", "pair_sethead", "pair_gettail", "pair_typetail", "pair_settail",
    "array_make", "array_length", "array_get", "array_type", "array_set",
    "closure_make", "closure_arity", "closure_call",
    "opaque_make", "opaque_get",
    "tie", "untie"
];

export abstract class BaseModulePlugin implements IModulePlugin {
    abstract readonly channelAttach: string[];
    abstract init(conduit: IConduit, channels: IChannel<any>[]): void;

    abstract exports: IModuleExport[];

    /** Is this module ready for use? */
    private __hooked: boolean = false;

    hook(evaluator: IDataHandler): void {
        if (this.__hooked) throw new ConductorInternalError("Module already hooked");
        this.__hooked = true;
        for (const methodName of methods) {
            this[methodName] = evaluator[methodName].bind(evaluator);
        }
    }
    unhook(): void {
        this.verifyHooked();
        this.__hooked = false;
        for (const methodName of methods) {
            delete this[methodName];
        }
    }
    isHooked(): boolean {
        return this.__hooked;
    }
    verifyHooked(): void {
        if (!this.__hooked) throw new ConductorInternalError("Module not hooked");
    }

    pair_assert(p: PairIdentifier, headType?: DataType, tailType?: DataType): boolean {
        if (headType) {
            const t = this.pair_typehead(p);
            if (!isSameType(t, headType)) throw new EvaluatorTypeError("Pair head assertion failure", DataType[headType], DataType[t]);
        }
        if (tailType) {
            const t = this.pair_typetail(p);
            if (!isSameType(t, tailType)) throw new EvaluatorTypeError("Pair tail assertion failure", DataType[tailType], DataType[t]);
        }
        return true;
    }
    array_assert(a: ArrayIdentifier, type?: DataType, length?: number): boolean {
        if (type) {
            const t = this.array_type(a);
            if (!isSameType(t, type)) throw new EvaluatorTypeError("Array type assertion failure", DataType[type], DataType[t]);
        }
        if (length) {
            const l = this.array_length(a);
            if (l !== length) throw new EvaluatorTypeError("Array length assertion failure", String(length), String(l));
        }
        return true;
    }
    closure_returnvalue<T extends DataType>(rv: ReturnValue<T>): ExternTypeOf<T> {
        return rv[0];
    }
    closure_returnvalue_checked<T extends DataType>(rv: ReturnValue<any>, type: T): ExternTypeOf<T> {
        this.closure_returntype_assert(rv, type);
        return rv[0];
    }
    closure_arity_assert(c: ClosureIdentifier, arity: number): boolean {
        const a = this.closure_arity(c);
        if (a !== arity) throw new EvaluatorTypeError("Closure arity assertion failure", String(arity), String(a));
        return true;
    }
    closure_returntype_assert<T extends DataType>(rv: ReturnValue<any>, type: T): asserts rv is ReturnValue<T> {
        const [_returnValue, returnType] = rv;
        if (isSameType(returnType, type)) throw new EvaluatorTypeError("Closure return type assertion failure", DataType[type], DataType[returnType]);
    }

    // To be populated by hook():
    pair_make: () => PairIdentifier;
    pair_gethead: (p: PairIdentifier) => ExternValue;
    pair_typehead: (p: PairIdentifier) => DataType;
    pair_sethead: (p: PairIdentifier, t: DataType, v: ExternValue) => void;
    pair_gettail: (p: PairIdentifier) => ExternValue;
    pair_typetail: (p: PairIdentifier) => DataType;
    pair_settail: (p: PairIdentifier, t: DataType, v: ExternValue) => void;

    array_make: (t: DataType, len: number, init?: ExternValue) => ArrayIdentifier;
    array_length: (a: ArrayIdentifier) => number;
    array_get: (a: ArrayIdentifier, idx: number) => ExternValue;
    array_type: (a: ArrayIdentifier) => DataType;
    array_set: (a: ArrayIdentifier, idx: number, v: ExternValue) => void;

    closure_make: <T extends IFunctionSignature>(sig: T, func: ExternCallable<T>, dependsOn?: Identifier[]) => ClosureIdentifier;
    closure_arity: (c: ClosureIdentifier) => number;
    closure_call: <T extends DataType>(c: ClosureIdentifier, args: ExternValue[]) => ReturnValue<T>;

    opaque_make: (v: any) => OpaqueIdentifier;
    opaque_get: (o: OpaqueIdentifier) => any;

    tie: (dependent: Identifier, dependee: Identifier) => void;
    untie: (dependent: Identifier, dependee: Identifier) => void;
}
