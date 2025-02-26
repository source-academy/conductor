import { CseInstructionType, HeapDataType, HeapIdentifier, ICseInstrHandler, ICseInstruction, ICseMachineState, IHeapArray } from "../types";
import { assertDataType } from "../util";

export interface IArrayLengthIns extends ICseInstruction {
    type: CseInstructionType.ARRAY_LENGTH;
}

export function makeArrayLengthIns(): IArrayLengthIns {
    return {
        type: CseInstructionType.ARRAY_LENGTH
    };
}

export const arrayLengthHandler: ICseInstrHandler<IArrayLengthIns> = [CseInstructionType.ARRAY_LENGTH, function arrayLengthHandler(state: ICseMachineState) {
    const arrId = state.stashPop();
    assertDataType("Cannot get length of array", arrId, HeapDataType.ARRAY);
    const arr = state.heapGet(arrId.value) as IHeapArray;
    state.stashPush({datatype: HeapDataType.NUMBER, value: arr.array.length});
}];
