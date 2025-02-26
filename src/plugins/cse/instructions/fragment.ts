import { CseInstructionType, ICseInstruction, IFragment } from "../types";

export interface IFragmentIns extends ICseInstruction {
    type: CseInstructionType.FRAGMENT;
    fragment: IFragment<any>;
}

export function makeFragmentIns(fragment: IFragment<any>): IFragmentIns {
    return {
        type: CseInstructionType.FRAGMENT,
        fragment
    };
}
