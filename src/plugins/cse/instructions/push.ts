import { CseInstructionType, ICseInstrHandler, ICseInstruction, ICseMachineState, IHeapTypedValue } from "../types";
import { isIdentifierType } from "../util";

export interface IPushIns extends ICseInstruction {
    type: CseInstructionType.PUSH;
    value: IHeapTypedValue;
}

export function makePushIns(value: IHeapTypedValue): IPushIns {
    const ref = isIdentifierType(value) ? [value.value] : [];
    return {
        type: CseInstructionType.PUSH,
        value,
        ref
    };
}

export const pushHandler: ICseInstrHandler<IPushIns> = [CseInstructionType.PUSH, function pushHandler(state: ICseMachineState, instr: IPushIns) {
    state.stashPush(instr.value);
}];
