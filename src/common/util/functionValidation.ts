import { EvaluatorCallbackError } from "../errors/EvaluatorCallbackError";

/**
 * Checks whether `value` is a function accepting exactly `length` parameters.
 * As with any JS function, rest/default parameters are not counted, so this is only a
 * best-effort check backed by `Function.prototype.length`.
 */
export function isFunctionOfLength(value: unknown, length: number): value is (...args: unknown[]) => unknown {
    return typeof value === "function" && value.length === length;
}

/**
 * Asserts that `value` is a function accepting exactly `length` parameters, throwing
 * {@link EvaluatorCallbackError} otherwise.
 * @param funcName The name of the function performing the check, used in the error message.
 * @param typeName Overrides the "function with N parameter(s)" wording in the error message.
 * @param paramName The name of the parameter being checked, if available.
 */
export function assertFunctionOfLength(value: unknown, length: number, funcName: string, typeName?: string, paramName?: string): asserts value is (...args: unknown[]) => unknown {
    if (!isFunctionOfLength(value, length)) {
        throw new EvaluatorCallbackError(typeName ?? length, value, funcName, paramName);
    }
}
