import IServiceMessage from "../IServiceMessage";
import ServiceMessageType from "../ServiceMessageType";

export default class Entry implements IServiceMessage {
    type = ServiceMessageType.ENTRY;
    data: string;
    constructor(entryPoint: string) {
        this.data = entryPoint;
    }
}
