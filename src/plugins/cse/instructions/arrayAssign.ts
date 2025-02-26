import { CseInstructionType, HeapDataType, ICseInstrHandler, ICseInstruction, ICseMachineState, IHeapArray } from "../types";
import { assertDataType } from "../util";

export interface IArrayAssignIns extends ICseInstruction {
    type: CseInstructionType.ARRAY_ASSIGN;
}

export function makeArrayAssignIns(): IArrayAssignIns {
    return {
        type: CseInstructionType.ARRAY_ASSIGN
    };
}

export const arrayAssignHandler: ICseInstrHandler<IArrayAssignIns> = [CseInstructionType.ARRAY_ASSIGN, function arrayAssignHandler(state: ICseMachineState) {
    const [arrId, idx, newVal] = state.stashPop(3);
    assertDataType("Cannot assign array index", arrId, HeapDataType.ARRAY);
    assertDataType("Cannot assign array index", idx, HeapDataType.NUMBER);
    const arr = state.heapGet(arrId.value) as IHeapArray;
    if (arr.type !== undefined) assertDataType("Non-matching array type", newVal, arr.type);
    arr.array[idx.value] = newVal;
}];
