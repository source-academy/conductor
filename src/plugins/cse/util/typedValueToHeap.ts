import { DataType, TypedValue } from "../../../conductor/types";
import { hdtMap, IHeapTypedValue } from "../types";

export function typedValueToHeap(tv: TypedValue<DataType>): IHeapTypedValue {
    return {
        datatype: hdtMap[tv.type],
        value: tv.value
    };
}
