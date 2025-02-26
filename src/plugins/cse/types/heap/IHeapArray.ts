import type { HeapDataType } from "./HeapDataType";
import type { ITypedValue } from "./ITypedValue";

export type IHeapArray = {
    type?: HeapDataType;
    array: ITypedValue[];
}
