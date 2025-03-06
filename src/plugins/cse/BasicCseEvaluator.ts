import { current, Draft, Immer } from "immer";

import { CsePlugin } from "./CsePlugin";
import { CseInstructionType, dtMap, hdtMap, HeapDataType, ICseInstrHandler, ICseInstruction, ICseMachineState, ICsePlugin, IFragment, IHeapArray, IHeapClosure, IHeapExtClosure, IHeapOpaque, IHeapPair, IHeapTypedValue } from "./types";
import { BasicEvaluator } from "../../conductor/runner/BasicEvaluator";
import { IEvaluator, IRunnerPlugin } from "../../conductor/runner/types";
import { CseMachineState } from "./CseMachineState";
import { applyHandler, arrayAssignHandler, arrayIndexHandler, arrayLengthHandler, arrayLiteralHandler, assignHandler, branchHandler, IBinaryOpIns, IFragmentIns, IUnaryOpIns, lookupHandler, makeApplyIns, makeFragmentIns, popHandler, pushHandler, restoreHandler } from "./instructions";
import { ConductorInternalError, EvaluatorTypeError } from "../../common/errors";
import { ArrayIdentifier, ClosureIdentifier, DataType, ExternCallable, IDataHandler, Identifier, IFunctionSignature, OpaqueIdentifier, PairIdentifier, TypedValue } from "../../conductor/types";
import { array_assert, closure_arity_assert, pair_assert } from "../../conductor/stdlib/util";
import { accumulate, is_list, length, list, list_to_vec } from "../../conductor/stdlib/list";
import { assertDataType, heapTypedValueToModule, typedValueToHeap } from "./util";
import { isSameType } from "../../conductor/util";

// construct own version of immer API to keep framework's purity
const { createDraft, finishDraft, produce } = /*#__PURE__*/ new Immer({autoFreeze: false});

export abstract class BasicCseEvaluator<F> extends BasicEvaluator implements IEvaluator, IDataHandler {
    static readonly instructionHandlers: ICseInstrHandler<any>[] = [
        applyHandler,
        arrayAssignHandler,
        arrayIndexHandler,
        arrayLengthHandler,
        arrayLiteralHandler,
        assignHandler,
        branchHandler,
        lookupHandler,
        popHandler,
        pushHandler,
        restoreHandler,
    ];

    readonly hasDataInterface = true;

    /** Conductor CSE plugin to send CSE-related data to host. */
    private readonly __csePlugin: ICsePlugin;

    /** The number of previous states to save. */
    private readonly __savedStates: number;

    /** The current CSE machine state. */
    private __cseState: ICseMachineState;

    /** The current CSE machine state draft. */
    private __cseDraft?: Draft<ICseMachineState>;

    /** CSE instruction handlers. Fragment, BinaryOp and UnaryOp instructions are handled separately. */
    private __handlers: Map<CseInstructionType, ICseInstrHandler<any>[1]>;

    /** The maximum number of steps to advance when receiving a chunk. */
    private __stepLimit: number = 100;

    /** step() mutex. */
    private __isStepping: boolean = false;

    /** Resolve the evaluateChunk() promise. */
    private __evalResolve?: (v: any) => void;

    /** Reject the evaluateChunk() promise. */
    private __evalReject?: (v: any) => void;

    /** A list of saved previous states. */
    private __previousStates: ICseMachineState[][] = [];

    /**
     * Verifies that we are currently drafting.
     */
    private __verifyHasDraft() {
        if (!this.__cseDraft) throw new ConductorInternalError("Not currently drafting");
    }

    /** Processes one step of the CSE machine from the current state. */
    private async __step(): Promise<void> {
        const nextInstr = this.__cseState.controlTop();
        if (!nextInstr) return;
        const draft = createDraft(this.__cseState);
        this.__cseDraft = draft;
        draft.controlPop();
        if (nextInstr.type === CseInstructionType.FRAGMENT) {
            const newInstructions = await this.evaluateFragment((nextInstr as IFragmentIns).fragment, current(draft));
            draft.controlPush(newInstructions);
        } else if (nextInstr.type === CseInstructionType.BINARY_OP) {
            const instr = nextInstr as IBinaryOpIns;
            const [op1, op2] = draft.stashPop(2);
            draft.stashPush(await this.binaryOpHandler(instr.operator, op1, op2));
        } else if (nextInstr.type === CseInstructionType.UNARY_OP) {
            const instr = nextInstr as IUnaryOpIns;
            const op = draft.stashPop();
            draft.stashPush(await this.unaryOpHandler(instr.operator, op));
        } else {
            if (!this.__handlers.has(nextInstr.type)) throw new ConductorInternalError(`Missing handler for ${nextInstr.type}`);
            await this.__handlers.get(nextInstr.type)!(draft, nextInstr);
        }
        draft.processStepDerefs();
        delete this.__cseDraft;
        this.__cseState = finishDraft(draft);
        this.__pushState();
        if (!this.__cseState.controlTop()) this.__resolve(this.__cseState.stashTop());
    }

    /** Saves the current state into the state history. */
    private __pushState() {
        // TODO: implementation...
    }

    /** The CSE machine encountered a problem and halted. */
    private __reject(v: any) {
        this.__evalReject?.(v);
        delete this.__evalResolve;
        delete this.__evalReject;
    }

    /** The CSE machine has produced a value. */
    private __resolve(v: any) {
        this.__evalResolve?.(v);
        delete this.__evalResolve;
        delete this.__evalReject;
    }

    /**
     * Processes one step of the CSE machine.
     * @returns When the step is complete.
     * @throws If called when a step is still processing.
     */
    async step(): Promise<void> {
        if (this.__isStepping) throw new ConductorInternalError("Already processing a step");

        this.__isStepping = true;
        try {
            await this.__step();
        } catch (e) {
            this.__reject(e);
            throw e;
        } finally {
            this.__isStepping = false;
        }
    }

    ///// Module Interface

    pair_make(head: TypedValue<DataType>, tail: TypedValue<DataType>): PairIdentifier {
        this.__verifyHasDraft();
        return this.__cseDraft!.alloc(HeapDataType.PAIR, {
            pair: [
                typedValueToHeap(head),
                typedValueToHeap(tail)
            ]
        } satisfies IHeapPair) as any;
    }

    pair_head(p: PairIdentifier): TypedValue<DataType> {
        this.__verifyHasDraft();
        const pair = this.__cseDraft!.heapGet(p) as IHeapPair;
        return heapTypedValueToModule(pair.pair[0]);
    }

    pair_sethead(p: PairIdentifier, v: TypedValue<DataType>): void {
        this.__verifyHasDraft();
        const pair = this.__cseDraft!.heapGet(p) as IHeapPair;
        const newValue = typedValueToHeap(v);
        this.__cseDraft!.replace(p, pair.pair[0], newValue);
        pair.pair[0] = newValue;
    }

    pair_tail(p: PairIdentifier): TypedValue<DataType> {
        this.__verifyHasDraft();
        const pair = this.__cseDraft!.heapGet(p) as IHeapPair;
        return heapTypedValueToModule(pair.pair[1]);
    }

    pair_settail(p: PairIdentifier, v: TypedValue<DataType>): void {
        this.__verifyHasDraft();
        const pair = this.__cseDraft!.heapGet(p) as IHeapPair;
        const newValue = typedValueToHeap(v);
        this.__cseDraft!.replace(p, pair.pair[1], newValue);
        pair.pair[1] = newValue;
    }

    pair_assert = pair_assert;

    array_make<T extends DataType>(t: T, len: number, init?: TypedValue<NoInfer<T>>): ArrayIdentifier<NoInfer<T>> {
        this.__verifyHasDraft();
        const datatype = hdtMap[t];
        return this.__cseDraft!.alloc(HeapDataType.ARRAY, {
            type: datatype,
            array: Array(len).fill(init)
        } satisfies IHeapArray) as any;
    }

    array_length(a: ArrayIdentifier<DataType>): number {
        this.__verifyHasDraft();
        const arr = this.__cseDraft!.heapGet(a) as IHeapArray;
        return arr.array.length;
    }

    array_get<T extends DataType>(a: ArrayIdentifier<T>, idx: number): TypedValue<DataType> {
        this.__verifyHasDraft();
        const arr = this.__cseDraft!.heapGet(a) as IHeapArray;
        return heapTypedValueToModule(arr.array[idx]);
    }

    array_type<T extends DataType>(a: ArrayIdentifier<T>): NoInfer<T> {
        this.__verifyHasDraft();
        const arr = this.__cseDraft!.heapGet(a) as IHeapArray;
        if (arr.type === undefined) return DataType.VOID as T;
        return dtMap[arr.type] as T;
    }

    array_set<T extends DataType>(a: ArrayIdentifier<T>, idx: number, tv: TypedValue<NoInfer<T>>): void {
        this.__verifyHasDraft();
        const arr = this.__cseDraft!.heapGet(a) as IHeapArray;
        const newValue = typedValueToHeap(tv);
        if (arr.type !== undefined) assertDataType("Cannot modify array - mismatching data type", newValue, arr.type);
        arr.array[idx] = newValue;
    }

    array_assert = array_assert;

    closure_make<const T extends IFunctionSignature>(sig: T, func: ExternCallable<T>, dependsOn?: (Identifier | null)[]): ClosureIdentifier<T["returnType"]> {
        this.__verifyHasDraft();
        const cId = this.__cseDraft!.alloc(HeapDataType.CLOSURE, {
            arity: sig.args.length,
            paramType: sig.args.map(t => hdtMap[t]),
            returnType: hdtMap[sig.returnType],
            closureName: sig.name,
            parentFrame: 0,
            callback: func
        } satisfies IHeapExtClosure);
        if (dependsOn) {
            for (const i of dependsOn) {
                if (i !== null) this.__cseDraft!.tie(cId, i);
            }
        }
        return cId as any;
    }

    closure_is_vararg(c: ClosureIdentifier<DataType>): boolean {
        return false; // TODO: varargs
    }

    closure_arity(c: ClosureIdentifier<DataType>): number {
        this.__verifyHasDraft();
        const closure = this.__cseDraft!.heapGet(c) as IHeapClosure | IHeapExtClosure;
        return closure.arity;
    }

    private async __closure_call<T extends DataType>(c: ClosureIdentifier<DataType>, args: TypedValue<DataType>[]): Promise<TypedValue<NoInfer<T>>> {
        this.__verifyHasDraft();
        const draft = this.__cseDraft!;
        draft.stashPush({datatype: HeapDataType.CLOSURE, value: c});
        draft.stashPush(args.map(tv => typedValueToHeap(tv)));
        draft.controlPush(makeApplyIns(args.length));
        // TODO finalise draft...
        // TODO then do steps...
        throw new Error("unimplemented");
        // TODO start new draft?
        // TODO return value...
    }

    async closure_call<T extends DataType>(c: ClosureIdentifier<DataType>, args: TypedValue<DataType>[], returnType: T): Promise<TypedValue<NoInfer<T>>> {
        const res = await this.__closure_call<T>(c, args);
        if (!isSameType(res.type, returnType)) throw new EvaluatorTypeError("Closure return value type mismatch", DataType[res.type], DataType[returnType]);
        return res;
    }

    async closure_call_unchecked<T extends DataType>(c: ClosureIdentifier<T>, args: TypedValue<DataType>[]): Promise<TypedValue<NoInfer<T>>> {
        return this.__closure_call<T>(c, args);
    }

    closure_arity_assert = closure_arity_assert;

    opaque_make(v: any, immutable: boolean = false): OpaqueIdentifier {
        this.__verifyHasDraft();
        return this.__cseDraft!.alloc(HeapDataType.OPAQUE, {
            value: v,
            immutable
        } satisfies IHeapOpaque) as any;
    }

    opaque_get(o: OpaqueIdentifier): any {
        this.__verifyHasDraft();
        const opaque = this.__cseDraft!.heapGet(o) as IHeapOpaque;
        return opaque.value;
    }

    opaque_update(o: OpaqueIdentifier, v: any): void {
        this.__verifyHasDraft();
        const opaque = this.__cseDraft!.heapGet(o) as IHeapOpaque;
        opaque.value = v;
    }

    tie(dependent: Identifier, dependee: Identifier | null): void {
        this.__verifyHasDraft();
        if (dependee === null) return;
        this.__cseDraft!.tie(dependent, dependee);
    }

    untie(dependent: Identifier, dependee: Identifier | null): void {
        this.__verifyHasDraft();
        if (dependee === null) return;
        this.__cseDraft!.untie(dependent, dependee);
    }

    list = list;
    is_list = is_list;
    list_to_vec = list_to_vec;
    accumulate = accumulate;
    length = length;

    // impl BasicEvaluator#evaluateChunk
    async evaluateChunk(chunk: string): Promise<void> {
        const f = await this.processChunk(chunk);
        const ins = makeFragmentIns(f);
        // reset to a fresh state
        this.__cseState = produce(this.__cseState, draft => {
            draft.controlClear();
            draft.controlPush(ins);
            draft.stashClear();
            draft.setCurrentFrame(1);
        });
        this.__pushState();
        const p = new Promise<void>((resolve, reject) => {
            this.__evalResolve = resolve;
            this.__evalReject = reject;
        });
        for (let i = 0; i < this.__stepLimit && this.__cseState.controlTop(); ++i) {
            await this.step();
        }
        return p;
    }

    /**
     * Processes a chunk into a Fragment (AST node).
     * @param chunk The chunk to be processed.
     * @returns The produced Fragment.
     */
    abstract processChunk(chunk: string): Promise<IFragment<F>>;

    /**
     * Evaluates a Fragment (AST node) by emitting an array of CSE machine instructions.
     * The instructions will be inserted into the Control in the given order, i.e. the next instruction to be processed is the last item in the array.
     * @param fragment The fragment to be evaluated.
     * @param state The current CSE machine state.
     * @returns An array of CSE machine instructions.
     */
    abstract evaluateFragment(fragment: IFragment<F>, state: ICseMachineState): ICseInstruction[] | Promise<ICseInstruction[]>;

    /**
     * Invokes a binary operator on two values from the Stash.
     * @param operator The operator to be invoked.
     * @param firstOperand The first operand that was pushed onto the Stash.
     * @param secondOperand The second operand that was pushed onto the Stash.
     * @returns The result of the operation to be pushed onto the Stash.
     */
    abstract binaryOpHandler(operator: string, firstOperand: IHeapTypedValue, secondOperand: IHeapTypedValue): IHeapTypedValue | Promise<IHeapTypedValue>;

    /**
     * Invokes a unary operator on a value from the Stash.
     * @param operator The operator to be invoked.
     * @param operand The operand from the Stash.
     * @returns The result of the operation to be pushed onto the Stash.
     */
    abstract unaryOpHandler(operator: string, operand: IHeapTypedValue): IHeapTypedValue | Promise<IHeapTypedValue>;

    constructor(conductor: IRunnerPlugin, handlers: ICseInstrHandler<any>[] = BasicCseEvaluator.instructionHandlers, savedStates: number = 8) {
        super(conductor);
        this.__csePlugin = conductor.registerPlugin(CsePlugin);
        this.__handlers = new Map(handlers);
        this.__savedStates = savedStates;
        this.__cseState = new CseMachineState();
    }
}
