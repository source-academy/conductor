import { HeapDataType } from "./HeapDataType";
import { HeapValue } from "./HeapValue";

export interface IHeapTypedValue {
    value: HeapValue;
    datatype: HeapDataType;
}
