import type { ResultPayload } from "./ResultPayload";

/**
 * A serializable value carried on user-facing channels
 * (__result, __stdio). Always includes a string representation;
 * optionally includes a typed payload for rich rendering.
 */
export interface ChannelValue {
    replString: string;
    payload?: ResultPayload;
}
