/**
 * Produces a short, human-readable representation of an arbitrary value for use in error
 * messages (e.g. "got 5", "got \"hello\"", "got null").
 */
export function stringifyValue(value: unknown): string {
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "function") return value.name ? `function ${value.name}` : "anonymous function";
    try {
        return JSON.stringify(value) ?? String(value);
    } catch {
        return String(value);
    }
}
