import { ICseInstruction } from "../ICseInstruction";
import { HeapDataType } from "./HeapDataType";

export type IHeapClosure = {
    paramType?: HeapDataType[];
    closureName?: string;
    paramName: string[];
    parentFrame: number;
    instructions: ICseInstruction[];
}
