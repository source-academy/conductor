import { CseInstructionType, HeapDataType, ICseInstrHandler, ICseInstruction, ICseMachineState } from "../types";
import { assertDataType } from "../util";

export interface IBranchIns extends ICseInstruction {
    type: CseInstructionType.BRANCH;
    consequent: ICseInstruction[];
    alternate?: ICseInstruction[];
}

export function makeBranchIns(consequent: ICseInstruction[], alternate?: ICseInstruction[]): IBranchIns {
    const altRef = alternate?.flatMap(v => v.ref ?? []) ?? [];
    const ref = consequent.flatMap(v => v.ref ?? []).concat(altRef);
    return {
        type: CseInstructionType.BRANCH,
        consequent,
        alternate,
        ref
    };
}

export const branchHandler: ICseInstrHandler<IBranchIns> = [CseInstructionType.BRANCH, function branchHandler(state: ICseMachineState, instr: IBranchIns) {
    const pred = state.stashPop();
    assertDataType("Cannot branch based on this value", pred, HeapDataType.BOOLEAN);
    if (pred.value) {
        state.controlPush(instr.consequent);
    } else if (instr.alternate) {
        state.controlPush(instr.alternate);
    }
}];
