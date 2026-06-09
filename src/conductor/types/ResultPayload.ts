/**
 * Base interface for rich result payloads.
 * The conductor treats this opaquely — concrete payload
 * types are defined downstream (e.g. in modules).
 */
export interface ResultPayload {
    type: string;
}
