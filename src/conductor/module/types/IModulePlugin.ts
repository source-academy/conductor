import type { IPlugin } from "../../../conduit";
import type { ArrayIdentifier, ClosureIdentifier, DataType, ExternCallable, ExternValue, Identifier, IDataHandler, IFunctionSignature, OpaqueIdentifier, PairIdentifier } from "../../types";
import type { IModuleExport } from "./IModuleExport";

export interface IModulePlugin extends IPlugin {
    exports: IModuleExport[];

    /**
     * Hooks an evaluator up to this module.
     * @param evaluator The evaluator we are interacting with.
     * @throws ConductorInternalError if the module has already been hooked up.
     */
    hook(evaluator: IDataHandler): void;

    /**
     * Unhooks the evaluator from this module.
     * @throws ConductorInternalError if the module has not been hooked up.
     */
    unhook(): void;

    /** 
     * Checks if the module has been hooked up.
     * @returns true if the module has been hooked up.
     */
    isHooked(): boolean;

    /**
     * Verifies if the module has been hooked up.
     * @throws ConductorInternalError if the module has not been hooked up.
     */
    verifyHooked(): void;

    // TODO: documentation for extern manip functions

    pair_make(): PairIdentifier;
    pair_gethead(p: PairIdentifier): ExternValue;
    pair_typehead(p: PairIdentifier): DataType;
    pair_sethead(p: PairIdentifier, t: DataType, v: ExternValue): void;
    pair_gettail(p: PairIdentifier): ExternValue;
    pair_typetail(p: PairIdentifier): DataType;
    pair_settail(p: PairIdentifier, t: DataType, v: ExternValue): void;

    array_make(t: DataType, len: number, init?: ExternValue): ArrayIdentifier;
    array_get(a: ArrayIdentifier, idx: number): ExternValue;
    array_type(a: ArrayIdentifier): DataType;
    array_set(a: ArrayIdentifier, idx: number, v: ExternValue): void;

    closure_make(sig: IFunctionSignature, func: ExternCallable): ClosureIdentifier;
    closure_call(c: ClosureIdentifier, args: ExternValue[]): ExternValue;

    opaque_make(v: any): OpaqueIdentifier;
    opaque_get(o: OpaqueIdentifier): any;

    type(i: Identifier): DataType;
    tie(dependent: Identifier, dependee: Identifier): void;
    untie(dependent: Identifier, dependee: Identifier): void;
    // free(i: Identifier): void;
}
