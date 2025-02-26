import { CseInstructionType, HeapDataType, ICseInstrHandler, ICseInstruction, ICseMachineState, IHeapArray } from "../types";
import { assertDataType } from "../util";

export interface IArrayLiteralIns extends ICseInstruction {
    type: CseInstructionType.ARRAY_LITERAL;
    length: number;
    datatype?: HeapDataType;
}

export function makeArrayLiteralIns(length: number, datatype?: HeapDataType): IArrayLiteralIns {
    return {
        type: CseInstructionType.ARRAY_LITERAL,
        length,
        datatype
    };
}

export const arrayLiteralHandler: ICseInstrHandler<IArrayLiteralIns> = [CseInstructionType.ARRAY_LITERAL, function arrayLiteralHandler(state: ICseMachineState, instr: IArrayLiteralIns) {
    const elements = state.stashPop(instr.length);
    if (instr.datatype) {
        for (const element of elements) {
            assertDataType("Cannot make array", element, instr.datatype);
        }
    }
    const arrId = state.alloc(HeapDataType.ARRAY, {
        type: instr.datatype,
        array: elements
    } satisfies IHeapArray);
    state.stashPush({datatype: HeapDataType.ARRAY, value: arrId});
}];
