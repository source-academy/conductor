const enum ServiceMessageType {
    /** A handshake message. See `serviceMessages.Hello`. */
    HELLO = 0,

    /** The evaluation entry point, sent from the host. See `serviceMessages.Entry`. */
    ENTRY = 1,
};

export default ServiceMessageType;
