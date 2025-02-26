import type { CseInstructionType } from "./CseInstructionType";
import type { HeapIdentifier } from "./heap";

export interface ICseInstruction {
    type: CseInstructionType;
    ref?: HeapIdentifier[];
}
