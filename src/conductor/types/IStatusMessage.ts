import type { RunnerStatus } from "./RunnerStatus";

export interface IStatusMessage {
    status: RunnerStatus;
    isActive: boolean;

    /**
     * How many sendOutput/sendResult/sendError messages the runner has sent so far, as of this
     * status update. Each conductor channel is its own MessagePort with no cross-channel delivery
     * ordering guarantee, so a STATUS message can be processed by the host before content sent
     * earlier on a different channel — this lets the host wait for its own received count to
     * reach sentCount before treating a terminal STOPPED/ERROR as safe to act on, instead of
     * guessing with a fixed delay.
     */
    sentCount: number;
}
