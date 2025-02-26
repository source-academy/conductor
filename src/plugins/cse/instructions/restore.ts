import { castDraft } from "immer";
import { Control, CseInstructionType, HeapIdentifier, ICseInstrHandler, ICseInstruction, ICseMachineState, Stash } from "../types";
import { isIdentifierType } from "../util";

export interface IRestoreIns extends ICseInstruction {
    type: CseInstructionType.RESTORE;
    control: Control;
    stash: Stash;
    currentFrame: HeapIdentifier;
    saveStash: number;
}

export function makeRestoreIns(state: ICseMachineState, saveStash: number = 0): IRestoreIns {
    const controlRef = state.control.flatMap(v => v.ref ?? []);
    const stashRef = state.stash.filter(isIdentifierType).map(v => v.value);
    const ref = controlRef.concat(stashRef, [state.currentFrame]);
    return {
        type: CseInstructionType.RESTORE,
        control: state.control,
        stash: state.stash,
        currentFrame: state.currentFrame,
        saveStash,
        ref
    };
}

export const restoreHandler: ICseInstrHandler<IRestoreIns> = [CseInstructionType.RESTORE, function restoreHandler(state: ICseMachineState, instr: IRestoreIns) {
    const savedStash = state.stashPop(instr.saveStash);
    const draft = castDraft(state); // state should be a draft; if not, stashPop above would have errored
    draft.control = instr.control;
    draft.stash = castDraft(instr.stash);
    draft.currentFrame = instr.currentFrame;
    draft.stashPush(savedStash);
}];
