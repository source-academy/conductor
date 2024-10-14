import type RunnerStatus from "./RunnerStatus";

interface StatusMessage {
    status: RunnerStatus;
    isActive: boolean;
}

export type { StatusMessage as default };
