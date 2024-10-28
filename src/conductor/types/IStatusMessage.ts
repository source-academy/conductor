import type RunnerStatus from "./RunnerStatus";

interface IStatusMessage {
    status: RunnerStatus;
    isActive: boolean;
}

export type { IStatusMessage as default };
