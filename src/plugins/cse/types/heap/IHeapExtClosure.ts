import { HeapDataType } from "./HeapDataType";

export type IHeapExtClosure = {
    arity: number;
    paramType?: HeapDataType[];
    returnType: HeapDataType;
    closureName?: string;
    paramName?: string[];
    parentFrame: number;
    callback: Function;
}
