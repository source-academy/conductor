import { type IHeapTypedValue, type HeapIdentifier, HeapDataType } from "../types";

export function isIdentifierType(typedValue: IHeapTypedValue): typedValue is IHeapTypedValue & {value: HeapIdentifier} {
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
