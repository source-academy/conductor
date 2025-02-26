import { type ITypedValue, type HeapIdentifier, HeapDataType } from "../types";

export function isIdentifierType(typedValue: ITypedValue): typedValue is ITypedValue & {value: HeapIdentifier} {
    switch (typedValue.datatype) {
        case HeapDataType.ARRAY:
        case HeapDataType.CLOSURE:
        case HeapDataType.FRAME:
        case HeapDataType.OPAQUE:
        case HeapDataType.PAIR:
            return true;
        default:
            return false;
    }
}
