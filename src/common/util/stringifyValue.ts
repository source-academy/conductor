const MAX_LENGTH = 100;

/**
 * Produces a short, human-readable representation of an arbitrary value for use in error
 * messages (e.g. "got 5", "got \"hello\"", "got null"). Never throws, even for circular
 * references or values with a throwing/missing `toString`, and truncates long output.
 */
export function stringifyValue(value: unknown): string {
    const result = stringifyValueUntruncated(value);
    return result.length > MAX_LENGTH ? `${result.slice(0, MAX_LENGTH)}...` : result;
}

function stringifyValueUntruncated(value: unknown): string {
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "bigint") return `${value}n`;
    if (typeof value === "symbol") return value.toString();
    if (typeof value === "function") return value.name ? `function ${value.name}` : "anonymous function";
    try {
        return JSON.stringify(value) ?? Object.prototype.toString.call(value);
    } catch {
        try {
            return String(value);
        } catch {
            return Object.prototype.toString.call(value);
        }
    }
}
