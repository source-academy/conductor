import { CseInstructionType, ICseInstrHandler, ICseInstruction, ICseMachineState } from "../types";

export interface ILookupIns extends ICseInstruction {
    type: CseInstructionType.LOOKUP;
    symbol: string;
}

export function makeLookupIns(symbol: string): ILookupIns {
    return {
        type: CseInstructionType.LOOKUP,
        symbol
    };
}

export const lookupHandler: ICseInstrHandler<ILookupIns> = [CseInstructionType.LOOKUP, function lookupHandler(state: ICseMachineState, instr: ILookupIns) {
    state.stashPush(state.lookup(instr.symbol));
}];
