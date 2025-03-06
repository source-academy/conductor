import { CseInstructionType, ICseInstrHandler, ICseInstruction, ICseMachineState, ITypedValue } from "../types";
import { isIdentifierType } from "../util";

export interface IPushIns extends ICseInstruction {
    type: CseInstructionType.PUSH;
    value: ITypedValue;
}

export function makePushIns(value: ITypedValue): IPushIns {
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
