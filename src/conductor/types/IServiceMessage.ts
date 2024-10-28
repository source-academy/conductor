import type ServiceMessageType from "./ServiceMessageType";

interface IServiceMessage {
    type: ServiceMessageType;
    data?: any;
}

export type { IServiceMessage as default };
