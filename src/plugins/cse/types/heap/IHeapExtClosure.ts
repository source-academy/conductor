import { HeapDataType } from "./HeapDataType";

export type IHeapExtClosure = {
    paramType?: HeapDataType[];
    returnType: HeapDataType;
    closureName?: string;
    paramName?: string[];
    parentFrame: number;
    callback: Function;
}
