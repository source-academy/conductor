import { ConductorInternalError } from "../../common/errors/ConductorInternalError";
import { IConduit, IChannel } from "../../conduit";
import { IDataHandler, PairIdentifier, ExternValue, DataType, ArrayIdentifier, IFunctionSignature, ExternCallable, ClosureIdentifier, Identifier, OpaqueIdentifier, ReturnValue, ExternTypeOf } from "../types";
import { IModulePlugin, IModuleExport } from "./types";

const methods: readonly (Exclude<keyof IDataHandler, "hasDataInterface">)[] = [
    "pair_make", "pair_gethead", "pair_typehead", "pair_sethead", "pair_gettail", "pair_typetail", "pair_settail", "pair_assert",
    "array_make", "array_length", "array_get", "array_type", "array_set", "array_assert",
    "closure_make", "closure_arity", "closure_call", "closure_returnvalue", "closure_returnvalue_checked", "closure_arity_assert", "closure_returntype_assert",
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
            // @ts-expect-error not forcing typing of identifiers in the evaluator is the point
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

    // To be populated by hook():
    pair_make!: () => PairIdentifier;
    pair_gethead!: (p: PairIdentifier) => ExternValue;
    pair_typehead!: (p: PairIdentifier) => DataType;
    pair_sethead!: (p: PairIdentifier, t: DataType, v: ExternValue) => void;
    pair_gettail!: (p: PairIdentifier) => ExternValue;
    pair_typetail!: (p: PairIdentifier) => DataType;
    pair_settail!: (p: PairIdentifier, t: DataType, v: ExternValue) => void;
    pair_assert!: (p: PairIdentifier, headType?: DataType, tailType?: DataType) => boolean;

    array_make!: (t: DataType, len: number, init?: ExternValue) => ArrayIdentifier;
    array_length!: (a: ArrayIdentifier) => number;
    array_get!: (a: ArrayIdentifier, idx: number) => ExternValue;
    array_type!: (a: ArrayIdentifier) => DataType;
    array_set!: (a: ArrayIdentifier, idx: number, v: ExternValue) => void;
    array_assert!: (a: ArrayIdentifier, type?: DataType, length?: number) => boolean;

    closure_make!: <T extends IFunctionSignature>(sig: T, func: ExternCallable<T>, dependsOn?: (Identifier | null)[]) => ClosureIdentifier;
    closure_arity!: (c: ClosureIdentifier) => number;
    closure_call!: <T extends DataType>(c: ClosureIdentifier, args: ExternValue[]) => ReturnValue<T>;
    closure_returnvalue!: <T extends DataType>(rv: ReturnValue<T>) => ExternTypeOf<T>;
    closure_returnvalue_checked!: <T extends DataType>(rv: ReturnValue<any>, type: T) => ExternTypeOf<T>;
    closure_arity_assert!: (c: ClosureIdentifier, arity: number) => boolean;
    closure_returntype_assert!: <T extends DataType>(rv: ReturnValue<T>, type: T) => asserts rv is ReturnValue<T>;

    opaque_make!: (v: any) => OpaqueIdentifier;
    opaque_get!: (o: OpaqueIdentifier) => any;

    tie!: (dependent: Identifier, dependee: Identifier | null) => void;
    untie!: (dependent: Identifier, dependee: Identifier | null) => void;
}
