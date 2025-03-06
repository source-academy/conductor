import { TypedValue } from "../../../conductor/types";
import { dtMap, HeapDataType, IHeapTypedValue } from "../types";

export function heapTypedValueToModule<T extends HeapDataType>(htv: IHeapTypedValue & {datatype: T}): TypedValue<typeof dtMap[T]> {
    return {
        type: dtMap[htv.datatype],
        value: htv.value
    } as any;
}
