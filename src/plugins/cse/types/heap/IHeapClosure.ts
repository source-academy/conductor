import { ICseInstruction } from "../ICseInstruction";
import { HeapDataType } from "./HeapDataType";

export type IHeapClosure = {
    paramType?: HeapDataType[];
    returnType: HeapDataType;
    paramName?: string[];
    parentFrame: number;
    instructions: ICseInstruction[];
}
