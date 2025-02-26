import { CseInstructionType, ICseInstruction } from "../types";

export interface IUnaryOpIns extends ICseInstruction {
    type: CseInstructionType.UNARY_OP;
    operator: string;
}

export function makeUnaryOpIns(operator: string): IUnaryOpIns {
    return {
        type: CseInstructionType.UNARY_OP,
        operator
    };
}
