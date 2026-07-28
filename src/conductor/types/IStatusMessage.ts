import type { RunnerStatus } from "./RunnerStatus";

export interface IStatusMessage {
    status: RunnerStatus;
    isActive: boolean;
    /**
     * The total number of output/result/error messages the runner has sent so far, as of this
     * status update. Lets a host wait for its own received-message count to catch up before
     * treating a terminal status (STOPPED/ERROR) as license to tear the runner down - the status
     * channel and the output/result/error channels are independent, so a host has no other way to
     * know whether a message sent just before STOPPED has actually arrived yet.
     */
    sentCount: number;
}
