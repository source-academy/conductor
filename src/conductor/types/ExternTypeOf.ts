import type { ArrayIdentifier } from "./ArrayIdentifier";
import type { ClosureIdentifier } from "./ClosureIdentifier";
import { DataType } from "./DataType";
import type { OpaqueIdentifier } from "./OpaqueIdentifier";
import type { PairIdentifier } from "./PairIdentifier";

type typeMap = {
    [DataType.VOID]: void;
    [DataType.BOOLEAN]: boolean;
    [DataType.NUMBER]: number;
    [DataType.CONST_STRING]: string;
    [DataType.EMPTY_LIST]: null;
    [DataType.PAIR]: PairIdentifier;
    [DataType.ARRAY]: ArrayIdentifier;
    [DataType.CLOSURE]: ClosureIdentifier;
    [DataType.OPAQUE]: OpaqueIdentifier;
}

export type ExternTypeOf<T> = T extends DataType ? typeMap[T] : never;
