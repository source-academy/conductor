import type { IServiceMessage } from "../IServiceMessage";
import { ServiceMessageType } from "../ServiceMessageType";

export class EntryServiceMessage implements IServiceMessage {
    type = ServiceMessageType.ENTRY;
    data: string;
    constructor(entryPoint: string) {
        this.data = entryPoint;
    }
}
