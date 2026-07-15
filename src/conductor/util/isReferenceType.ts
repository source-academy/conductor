import { DataType } from "../types";

const lookupTable: Record<DataType, boolean> = {
    [DataType.VOID]: false,
    [DataType.BOOLEAN]: false,
    [DataType.NUMBER]: false,
    [DataType.CONST_STRING]: false,
    [DataType.EMPTY_LIST]: true, // technically not; see list
    [DataType.PAIR]: true,
    [DataType.ARRAY]: true,
    [DataType.CLOSURE]: true,
    [DataType.OPAQUE]: true,
    [DataType.LIST]: true, // technically not, but easier to do this due to pair being so
    [DataType.ANY]: false, // never a value's own type tag; only ever a declared parameter type
}

export function isReferenceType(type: DataType): boolean {
    return lookupTable[type];
}
