import type { HeapDataType } from "./HeapDataType";
import type { IHeapTypedValue } from "./IHeapTypedValue";

export type IHeapArray = {
    type?: HeapDataType;
    array: IHeapTypedValue[];
}
