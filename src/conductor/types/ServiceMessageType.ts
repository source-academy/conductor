export const enum ServiceMessageType {
    /** A handshake message. See `serviceMessages.Hello`. */
    HELLO = 0,

    /** Abort the connection, due to mismatching protocol versions. See `serviceMessages.Abort`. */
    ABORT = 1,

    /** The evaluation entry point, sent from the host. See `serviceMessages.Entry`. */
    ENTRY = 2,
};
