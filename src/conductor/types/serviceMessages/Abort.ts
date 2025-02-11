import { IServiceMessage } from "../IServiceMessage";
import { ServiceMessageType } from "../ServiceMessageType";

export class Abort implements IServiceMessage {
    type = ServiceMessageType.ABORT;
    data: {minVersion: number};
    constructor(minVersion: number) {
        this.data = {minVersion: minVersion};
    }
}
