import { CseInstructionType, ICseInstrHandler, ICseInstruction, ICseMachineState } from "../types";

export interface IAssignIns extends ICseInstruction {
    type: CseInstructionType.ASSIGN;
    symbol: string;
    constant: boolean;
}

export function makeAssignIns(symbol: string, constant: boolean): IAssignIns {
    return {
        type: CseInstructionType.ASSIGN,
        symbol,
        constant
    };
}

export const assignHandler: ICseInstrHandler<IAssignIns> = [CseInstructionType.ASSIGN, function assignHandler(state: ICseMachineState, instr: IAssignIns) {
    const val = state.stashPop();
    state.modify(instr.symbol, val);
}];
