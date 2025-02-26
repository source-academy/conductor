import { CseInstructionType, HeapDataType, ICseInstrHandler, ICseInstruction, ICseMachineState, IHeapArray } from "../types";
import { assertDataType } from "../util";

export interface IArrayIndexIns extends ICseInstruction {
    type: CseInstructionType.ARRAY_INDEX;
}

export function makeArrayIndexIns(): IArrayIndexIns {
    return {
        type: CseInstructionType.ARRAY_INDEX
    };
}

export const arrayIndexHandler: ICseInstrHandler<IArrayIndexIns> = [CseInstructionType.ARRAY_INDEX, function arrayIndexHandler(state: ICseMachineState) {
    const [arrId, idx] = state.stashPop(2);
    assertDataType("Cannot index array", arrId, HeapDataType.ARRAY);
    assertDataType("Cannot index array", idx, HeapDataType.NUMBER);
    const arr = state.heapGet(arrId.value) as IHeapArray;
    state.stashPush(arr.array[idx.value]);
}];
