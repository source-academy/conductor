import { Immer } from "immer";

import { CsePlugin } from "./CsePlugin";
import { CseInstructionType, ICseInstrHandler, ICseInstruction, ICseMachineState, ICsePlugin, IFragment, ITypedValue } from "./types";
import { BasicEvaluator } from "../../conductor/runner/BasicEvaluator";
import { IEvaluator, IRunnerPlugin } from "../../conductor/runner/types";
import { CseMachineState } from "./CseMachineState";
import { applyHandler, arrayAssignHandler, arrayIndexHandler, arrayLengthHandler, arrayLiteralHandler, assignHandler, branchHandler, IBinaryOpIns, IFragmentIns, IUnaryOpIns, lookupHandler, makeFragmentIns, popHandler, restoreHandler } from "./instructions";
import { ConductorInternalError } from "../../common/errors";

// construct own version of immer API to keep framework's purity
const { createDraft, finishDraft, produce } = /*#__PURE__*/ new Immer({autoFreeze: false});

export abstract class BasicCseEvaluator<F> extends BasicEvaluator implements IEvaluator {
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
        restoreHandler,
    ];

    /** Conductor CSE plugin to send CSE-related data to host. */
    private readonly __csePlugin: ICsePlugin;

    /** The number of previous states to save. */
    private readonly __savedStates: number;

    /** The current CSE machine state. */
    private __cseState: ICseMachineState;

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

    /** Processes one step of the CSE machine from the current state. */
    private async __step(): Promise<void> {
        const nextInstr = this.__cseState.controlTop();
        if (!nextInstr) return;
        const draft = createDraft(this.__cseState);
        draft.setCurrentInstr(nextInstr);
        draft.controlPop();
        if (nextInstr.type === CseInstructionType.FRAGMENT) {
            const newInstructions = await this.evaluateFragment((nextInstr as IFragmentIns).fragment);
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
     * @returns An array of CSE machine instructions.
     */
    abstract evaluateFragment(fragment: IFragment<F>): ICseInstruction[] | Promise<ICseInstruction[]>;

    /**
     * Invokes a binary operator on two values from the Stash.
     * @param operator The operator to be invoked.
     * @param firstOperand The first operand that was pushed onto the Stash.
     * @param secondOperand The second operand that was pushed onto the Stash.
     * @returns The result of the operation to be pushed onto the Stash.
     */
    abstract binaryOpHandler(operator: string, firstOperand: ITypedValue, secondOperand: ITypedValue): ITypedValue | Promise<ITypedValue>;

    /**
     * Invokes a unary operator on a value from the Stash.
     * @param operator The operator to be invoked.
     * @param operand The operand from the Stash.
     * @returns The result of the operation to be pushed onto the Stash.
     */
    abstract unaryOpHandler(operator: string, operand: ITypedValue): ITypedValue | Promise<ITypedValue>;

    constructor(conductor: IRunnerPlugin, handlers: ICseInstrHandler<any>[] = BasicCseEvaluator.instructionHandlers, savedStates: number = 8) {
        super(conductor);
        this.__csePlugin = conductor.registerPlugin(CsePlugin);
        this.__handlers = new Map(handlers);
        this.__savedStates = savedStates;
        this.__cseState = new CseMachineState();
    }
}
