import type { ServiceMessageType } from "./ServiceMessageType";

export interface IServiceMessage {
    type: ServiceMessageType;
    data?: any;
}
