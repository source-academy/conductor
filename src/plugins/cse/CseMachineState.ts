import { castDraft, immerable } from "immer";
import { ITypedValue, IHeapEnvFrame, IHeapNode, HeapIdentifier, HeapData, ICseInstruction, Control, Stash, ICseMachineState } from "./types";
import { HeapDataType } from "./types/heap/HeapDataType";
import { ConductorInternalError } from "../../common/errors";
import { isIdentifierType, verifyDraft } from "./util";

function makeFrame(label: string, parent?: number, names?: string[], bindings?: Record<string, ITypedValue>, constant?: Record<string, boolean>): IHeapEnvFrame {
    return Object.freeze({
        label: label,
        parent: parent,
        names: names ? [...names] : [],
        bindings: bindings ? structuredClone(bindings) : {},
        constant: constant ? structuredClone(constant) : {},
    });
}

function makeHeapNode(type: HeapDataType, value: HeapData): IHeapNode {
    return {
        type,
        value,
        ref: new Set(),
        rc: 0
    };
}

export class CseMachineState implements ICseMachineState {
    static [immerable] = true;

    // ideally, this would be private, but we cannot access this property on the draft if it is
    // so as a workaround we do not mark it as private but instead omit it from the interface
    // terser mangling will probably render this quite unusable anyway
    /** An array of identifiers dereferenced in the current step. */
    readonly __stepDerefs: readonly HeapIdentifier[] = [];

    ///// CONTROL

    readonly control: Control = [];

    readonly currentInstr: ICseInstruction | undefined;

    ///// STASH

    readonly stash: Stash = [];

    ///// ENVIRONMENT

    readonly heap: readonly IHeapNode[];
    readonly recycleQueue: readonly HeapIdentifier[] = [];

    readonly currentFrame: HeapIdentifier;

    ///// CONSTRUCTOR

    constructor() {
        this.heap = [
            makeHeapNode(HeapDataType.FRAME, makeFrame("Global")),
            makeHeapNode(HeapDataType.FRAME, makeFrame("Program", 0))
        ];
        this.currentFrame = 1;
    }

    ///// CONTROL

    @verifyDraft
    controlPush(items: ICseInstruction | ICseInstruction[]): void {
        const draft = castDraft(this);
        if (!Array.isArray(items)) {
            items = [items];
        }
        draft.control.push(...items);
        for (const instr of items) {
            if (instr.ref) {
                for (const i of instr.ref) {
                    draft.incrementRef(i);
                }
            }
        }
    }

    controlTop(): ICseInstruction | undefined {
        return this.control[this.control.length - 1];
    }

    @verifyDraft
    controlPop(): ICseInstruction | undefined {
        const draft = castDraft(this);
        const instr = draft.control.pop();
        if (instr && instr.ref) {
            for (const i of instr.ref) {
                draft.decrementRef(i);
            }
        }
        return instr;
    }

    @verifyDraft
    controlClear(): void {
        const draft = castDraft(this);
        for (const instr of draft.control) {
            if (instr.ref) {
                for (const i of instr.ref) {
                    draft.decrementRef(i);
                }
            }
        }
        draft.control = [];
    }

    ///// STASH

    @verifyDraft
    stashPush(items: ITypedValue | ITypedValue[]): void {
        const draft = castDraft(this);
        if (!Array.isArray(items)) {
            items = [items];
        }
        draft.stash.push(...items);
        for (const item of items) {
            if (isIdentifierType(item)) {
                draft.incrementRef(item.value);
            }
        }
    }

    stashTop(): ITypedValue | undefined;
    stashTop(numItems: number): ITypedValue[];
    stashTop(numItems?: number): ITypedValue | undefined | ITypedValue[] {
        if (numItems === undefined) return this.stash[this.stash.length - 1];
        if (this.stash.length > numItems) throw new ConductorInternalError("Not enough items in stash!");
        return this.stash.slice(-numItems);
    }

    stashPop(): ITypedValue;
    stashPop(numItems: number): ITypedValue[];
    @verifyDraft
    stashPop(numItems?: number): ITypedValue | ITypedValue[] {
        const draft = castDraft(this);
        if (numItems === undefined) {
            if (draft.stash.length === 0) throw new ConductorInternalError("Stash is empty!");
            const item = draft.stash.pop()!;
            if (isIdentifierType(item)) draft.decrementRef(item.value);
            return item;
        }
        if (draft.stash.length > numItems) throw new ConductorInternalError("Not enough items in stash!");
        const removedItems = draft.stash.splice(-numItems);
        for (const item of removedItems) {
            if (isIdentifierType(item)) {
                draft.decrementRef(item.value);
            }
        }
        return removedItems;
    }

    @verifyDraft
    stashClear(): void {
        const draft = castDraft(this);
        for (const item of draft.stash) {
            if (isIdentifierType(item)) {
                draft.decrementRef(item.value);
            }
        }
        draft.stash = [];
    }

    ///// ENVIRONMENT

    heapGet(i: HeapIdentifier): HeapData {
        const ret = this.heap[i].value;
        if (ret === undefined) throw new ConductorInternalError("Invalid identifier!");
        return ret;
    }

    @verifyDraft
    alloc(type: HeapDataType, value: HeapData): HeapIdentifier {
        const draft = castDraft(this);
        const i = draft.recycleQueue.pop();
        if (i !== undefined) {
            draft.heap[i].type = type;
            draft.heap[i].value = value;
            return i;
        } else {
            draft.heap.push(castDraft(makeHeapNode(type, value)));
            return draft.heap.length - 1;
        }
    }

    @verifyDraft
    incrementRef(i: HeapIdentifier): void {
        const draft = castDraft(this);
        ++draft.heap[i].rc;
    }

    @verifyDraft
    decrementRef(i: HeapIdentifier): void {
        const draft = castDraft(this);
        // --draft.heap[i].rc;
        draft.__stepDerefs.push(i);
    }

    @verifyDraft
    processStepDerefs(): void {
        const draft = castDraft(this);
        for (const ref of draft.__stepDerefs) {
            --draft.heap[ref].rc;
            // TODO if rc == 0 initiate clean?
        }
        draft.__stepDerefs = [];
    }

    @verifyDraft
    tie(dependent: HeapIdentifier, dependee: HeapIdentifier): void {
        const draft = castDraft(this);
        if (!draft.heap[dependent].ref.has(dependee)) {
            draft.heap[dependent].ref.add(dependee);
            draft.incrementRef(dependee);
        }
    }

    @verifyDraft
    untie(dependent: HeapIdentifier, dependee: HeapIdentifier): void {
        const draft = castDraft(this);
        if (draft.heap[dependent].ref.has(dependee)) {
            draft.heap[dependent].ref.delete(dependee);
            draft.decrementRef(dependee);
        }
    }

    @verifyDraft
    clean(toClean?: HeapIdentifier[]): void {
        const draft = castDraft(this);
        if (toClean === undefined) {
            toClean = [];
            for (let i = 0; i < draft.heap.length; ++i) {
                if (draft.heap[i].rc === 0) toClean.push(i);
            }
        }
        while (toClean.length > 0) {
            const i = toClean.pop()!; // length > 0
            const node = draft.heap[i];
            if (node.rc === 0 && node.type !== HeapDataType.UNASSIGNED) {
                delete node.value;
                node.type = HeapDataType.UNASSIGNED;
                for (const j of node.ref) {
                    --draft.heap[j].rc;
                    if (draft.heap[j].rc === 0) toClean.push(j);
                }
                node.ref.clear();
                draft.recycleQueue.push(i);
            }
        }
    }

    @verifyDraft
    markSweep(): void {
        const draft = castDraft(this);
        // TODO gc
    }

    getFrame(frameId: HeapIdentifier = this.currentFrame): IHeapEnvFrame {
        const node = this.heap[frameId];
        if (node.type !== HeapDataType.FRAME) throw new ConductorInternalError("heapnode isn't a frame!");
        return this.heap[frameId].value as IHeapEnvFrame;
    }

    findFrame(name: string, frameId: HeapIdentifier = this.currentFrame): HeapIdentifier | undefined {
        while (true) {
            const frame = this.getFrame(frameId);
            if (name in frame.bindings) {
                return frameId;
            }
            if (!frame.parent) return;
            frameId = frame.parent;
        }
    }

    @verifyDraft
    makeFrame(label: string, names?: string[], bindings?: Record<string, ITypedValue>, parent: HeapIdentifier = this.currentFrame): void {
        const draft = castDraft(this);
        const frameId = draft.alloc(HeapDataType.FRAME, makeFrame(label, parent, names, bindings));
        draft.tie(frameId, parent);
        for (const name in bindings) {
            if (isIdentifierType(bindings[name])) {
                draft.tie(frameId, bindings[name].value);
            }
        }
        draft.currentFrame = frameId;
    }

    @verifyDraft
    setCurrentFrame(frameId: HeapIdentifier): void {
        const draft = castDraft(this);
        draft.currentFrame = frameId;
    }

    lookup(name: string, frameId: HeapIdentifier = this.currentFrame): ITypedValue {
        const targetFrameId = this.findFrame(name, frameId);
        if (targetFrameId === undefined) throw new Error("can't find name!"); // TODO lookup error
        return this.getFrame(targetFrameId).bindings[name];
    }

    @verifyDraft
    modify(name: string, newValue: ITypedValue, frameId: HeapIdentifier = this.currentFrame): void {
        const draft = castDraft(this);
        const targetFrameId = draft.findFrame(name, frameId);
        if (targetFrameId === undefined) throw new Error("can't find name!"); // TODO lookup error
        const targetFrame = draft.getFrame(targetFrameId);
        if (isIdentifierType(targetFrame.bindings[name])) {
            draft.untie(targetFrameId, targetFrame.bindings[name].value);
        }
        targetFrame.bindings[name] = newValue;
        if (isIdentifierType(newValue)) {
            draft.tie(targetFrameId, newValue.value);
        }
    }
}
