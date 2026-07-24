import { ConductorInternalError } from "../../common/errors";
import { RunnerStatus } from "../types";
import type { IEvaluator, IRunnerPlugin } from "./types";

export abstract class BasicEvaluator implements IEvaluator {
    readonly conductor: IRunnerPlugin;

    /**
     * Outstanding units of async work an evaluator has told us about via beginPendingWork() and
     * not yet matched with endPendingWork() - e.g. a scheduled real-time callback (Python's
     * set_timeout) that may still run well after evaluateChunk()'s own promise has resolved.
     * RunnerStatus.STOPPED is withheld while this is nonzero, since "STOPPED" means "the
     * environment is no longer valid" (see RunnerStatus's own doc comment) - sending it while an
     * evaluator itself knows more of its own code may still run is a lie the host has no way to
     * detect, and it terminates the runner (host-side convention, e.g. Source Academy's frontend)
     * out from under that still-pending work.
     */
    private pendingWork = 0;
    private onPendingWorkSettled: (() => void) | null = null;

    /**
     * Registers one unit of outstanding async work, deferring RunnerStatus.STOPPED until a
     * matching endPendingWork() call (or more precisely, until every such call this evaluator has
     * made is matched - nesting/rescheduling is fine either way round: a callback that begins new
     * pending work *before* matching its own, or one that matches its own first and only then
     * begins the next (e.g. a timeout rescheduling itself from inside its fired callback), both
     * keep STOPPED withheld correctly - see the re-checking loop in startEvaluator, which is what
     * actually makes the latter ordering safe despite the count briefly touching zero).
     */
    protected beginPendingWork(): void {
        this.pendingWork++;
    }

    /** Matches a prior beginPendingWork() call. See its doc comment for nesting semantics. */
    protected endPendingWork(): void {
        if (this.pendingWork === 0) {
            throw new ConductorInternalError("endPendingWork() called without a matching beginPendingWork()");
        }
        this.pendingWork--;
        if (this.pendingWork === 0) {
            this.onPendingWorkSettled?.();
            this.onPendingWorkSettled = null;
        }
    }

    /** Resolves the next time pendingWork returns to 0 (or immediately, if already 0 right now) -
     * a single edge, not a guarantee it's still 0 by the time the caller wakes up and checks again
     * (see startEvaluator's re-checking loop, which is what actually closes that gap). */
    private nextPendingWorkSettled(): Promise<void> {
        if (this.pendingWork === 0) return Promise.resolve();
        return new Promise(resolve => {
            this.onPendingWorkSettled = resolve;
        });
    }

    async startEvaluator(entryPoint: string): Promise<void> {
        try {
            const initialChunk = await this.conductor.requestFile(entryPoint);
            if (!initialChunk) throw new ConductorInternalError("Cannot load entrypoint file");
            this.conductor.sendResult(await this.evaluateFile(entryPoint, initialChunk));
        } catch (e) {
            // Always notify the host so it can unblock its own REPL loop.
            this.conductor.updateStatus(RunnerStatus.ERROR, true);
            throw e;
        }
        // A settled wait only proves pendingWork *touched* 0 at some past instant - a callback
        // that matches its own pending work and then immediately begins the next unit (e.g.
        // rescheduling itself) can slip a new beginPendingWork() in before this ever wakes up and
        // looks again, so re-check rather than trust a single wait.
        while (this.pendingWork > 0) {
            await this.nextPendingWorkSettled();
        }
        this.conductor.updateStatus(RunnerStatus.STOPPED, true);
    }

    /**
     * Evaluates a file.
     * @param fileName The name of the file to be evaluated.
     * @param fileContent The content of the file to be evaluated.
     * @returns A promise that resolves to the result of the file when the evaluation is complete.
     */
    async evaluateFile(fileName: string, fileContent: string): Promise<any> {
        return this.evaluateChunk(fileContent);
    }

    /**
     * Evaluates a chunk.
     * @param chunk The chunk to be evaluated.
     * @returns A promise that resolves to the result of the chunk when the evaluation is complete.
     */
    abstract evaluateChunk(chunk: string): Promise<any>;

    constructor(conductor: IRunnerPlugin) {
        this.conductor = conductor;
    }
}
