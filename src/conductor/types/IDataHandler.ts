import type { ArrayIdentifier, ClosureIdentifier, DataType, ExternCallable, ExternValue, Identifier, IFunctionSignature, OpaqueIdentifier, PairIdentifier } from ".";

export interface IDataHandler {
    readonly hasDataInterface: true;

    pair_make(): Identifier; // not PairIdentifier so evaluators do not need to cast
    pair_gethead(p: PairIdentifier): ExternValue;
    pair_typehead(p: PairIdentifier): DataType;
    pair_sethead(p: PairIdentifier, t: DataType, v: ExternValue): void;
    pair_gettail(p: PairIdentifier): ExternValue;
    pair_typetail(p: PairIdentifier): DataType;
    pair_settail(p: PairIdentifier, t: DataType, v: ExternValue): void;

    array_make(t: DataType, len: number, init?: ExternValue): Identifier; // not ArrayIdentifier
    array_get(a: ArrayIdentifier, idx: number): ExternValue;
    array_type(a: ArrayIdentifier): DataType;
    array_set(a: ArrayIdentifier, idx: number, v: ExternValue): void;

    closure_make(sig: IFunctionSignature, func: ExternCallable): Identifier; // not ClosureIdentifier
    closure_call(c: ClosureIdentifier, args: ExternValue[]): ExternValue;

    opaque_make(v: any): Identifier; // not OpaqueIdentifier
    opaque_get(o: OpaqueIdentifier): any;

    type(i: Identifier): DataType;
    tie(dependent: Identifier, dependee: Identifier): void;
    untie(dependent: Identifier, dependee: Identifier): void;
    // free(i: Identifier): void;
}
