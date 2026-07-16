import type { ArrayIdentifier } from "./ArrayIdentifier";
import type { ClosureIdentifier } from "./ClosureIdentifier";
import { DataType } from "./DataType";
import type { List } from "./List";
import type { OpaqueIdentifier } from "./OpaqueIdentifier";
import type { PairIdentifier } from "./PairIdentifier";

type typeMap<U extends DataType> = {
    [DataType.VOID]: void;
    [DataType.BOOLEAN]: boolean;
    [DataType.NUMBER]: number;
    [DataType.CONST_STRING]: string;
    [DataType.EMPTY_LIST]: null;
    [DataType.PAIR]: PairIdentifier;
    [DataType.ARRAY]: ArrayIdentifier<U>;
    [DataType.CLOSURE]: ClosureIdentifier<U>;
    [DataType.OPAQUE]: OpaqueIdentifier;
    [DataType.LIST]: List;
    // Unreachable in practice - TypedValue<DataType.ANY, U> is special-cased to expand to the
    // union of all concrete TypedValues instead of ever indexing this map with DataType.ANY, but
    // typeMap must still have an entry for every DataType member to stay soundly typed.
    [DataType.ANY]: unknown;
}

/** Maps the Conductor DataTypes to their corresponding native types. */
export type ExternTypeOf<T extends DataType, U extends DataType = DataType> = T extends DataType ? typeMap<U>[T] : never;
