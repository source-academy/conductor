import { CseInstructionType, ICseInstrHandler, ICseInstruction, ICseMachineState } from "../types";

export interface IPopIns extends ICseInstruction {
    type: CseInstructionType.POP;
}

export function makePopIns(): IPopIns {
    return {
        type: CseInstructionType.POP
    };
}

export const popHandler: ICseInstrHandler<IPopIns> = [CseInstructionType.POP, function popHandler(state: ICseMachineState) {
    state.stashPop();
}];
