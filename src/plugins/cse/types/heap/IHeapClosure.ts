import { ICseInstruction } from "../ICseInstruction";
import { HeapDataType } from "./HeapDataType";

export type IHeapClosure = {
    arity: number;
    paramType?: HeapDataType[];
    closureName?: string;
    paramName: string[];
    parentFrame: number;
    instructions: ICseInstruction[];
}
