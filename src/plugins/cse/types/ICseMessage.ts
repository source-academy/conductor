import type { CseMessageType } from "./CseMessageType";

export interface ICseMessage {
    /** The type of message. */
    type: CseMessageType;

    /** The content of the message. */
    content?: string;
}
