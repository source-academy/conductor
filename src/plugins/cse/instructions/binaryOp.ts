import { CseInstructionType, ICseInstruction } from "../types";

export interface IBinaryOpIns extends ICseInstruction {
    type: CseInstructionType.BINARY_OP;
    operator: string;
}

export function makeBinaryOpIns(operator: string): IBinaryOpIns {
    return {
        type: CseInstructionType.BINARY_OP,
        operator
    };
}
