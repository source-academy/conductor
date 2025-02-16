import type { IServiceMessage } from "../IServiceMessage";
import { ServiceMessageType } from "../ServiceMessageType";

export class AbortServiceMessage implements IServiceMessage {
    type = ServiceMessageType.ABORT;
    data: {minVersion: number};
    constructor(minVersion: number) {
        this.data = {minVersion: minVersion};
    }
}
