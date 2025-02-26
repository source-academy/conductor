import { HeapDataType } from "./HeapDataType";
import { HeapValue } from "./HeapValue";

export interface ITypedValue {
    value: HeapValue;
    datatype: HeapDataType;
}
