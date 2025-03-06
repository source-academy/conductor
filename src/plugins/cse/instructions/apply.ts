import { CseInstructionType, ICseInstrHandler, ICseInstruction, ICseMachineState, IHeapClosure, IHeapExtClosure, ITypedValue } from "../types";
import { HeapDataType } from "../types/heap/HeapDataType";
import { assertDataType } from "../util";

export interface IApplyIns extends ICseInstruction {
    type: CseInstructionType.APPLY;
    arity: number;
}

export function makeApplyIns(arity: number): IApplyIns {
    return {
        type: CseInstructionType.APPLY,
        arity
    };
}

export const applyHandler: ICseInstrHandler<IApplyIns> = [CseInstructionType.APPLY, function applyHandler(state: ICseMachineState, instr: IApplyIns) {
    const cId = state.stashPop();
    const args = state.stashPop(instr.arity);
    assertDataType("Cannot apply", cId, HeapDataType.CLOSURE);
    const closure = state.heapGet(cId.value) as IHeapClosure | IHeapExtClosure;
    if (closure.paramType) {
        for (let i = 0; i < closure.paramType.length; ++i) {
            assertDataType("Cannot apply - argument type mismatch", args[i], closure.paramType[i]);
        }
    }
    if ("instructions" in closure) {
        const bindings: Record<string, ITypedValue> = {};
        for (let i = 0; i < closure.paramName.length; ++i) {
            bindings[closure.paramName[i]] = args[i];
        }
        state.makeFrame(closure.closureName ?? "closure", closure.paramName, bindings, closure.parentFrame);
        state.controlPush(closure.instructions);
    } else {
        const value = closure.callback(...args.map(v => v.value));
        if (closure.returnType === HeapDataType.UNASSIGNED) return;
        state.stashPush({datatype: closure.returnType, value});
    }
}];
