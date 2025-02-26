import { CseInstructionType, ICseInstrHandler, ICseInstruction, ICseMachineState, IHeapClosure } from "../types";
import { HeapDataType } from "../types/heap/HeapDataType";
import { assertDataType } from "../util";

export interface IApplyIns extends ICseInstruction {
    type: CseInstructionType.APPLY;
    arity: number;
}

export function makeApplyIns(arity: number): IApplyIns {
    return {
        type: CseInstructionType.APPLY,
        arity
    };
}

export const applyHandler: ICseInstrHandler<IApplyIns> = [CseInstructionType.APPLY, function applyHandler(state: ICseMachineState, instr: IApplyIns) {
    const cId = state.stashPop();
    const args = state.stashPop(instr.arity);
    assertDataType("Cannot apply", cId, HeapDataType.CLOSURE);
    const closure = state.heapGet(cId.value) as IHeapClosure;
    if (closure.paramName) {
        // TODO
    }
}];
