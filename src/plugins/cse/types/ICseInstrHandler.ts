import type { ICseInstruction } from "./ICseInstruction";
import type { ICseMachineState } from "./ICseMachineState";

export type ICseInstrHandler<I extends ICseInstruction> = [I["type"], (state: ICseMachineState, instr: I) => void | Promise<void>];
