import { EvaluatorNumberRangeError } from "../errors/EvaluatorNumberRangeError";

/**
 * Checks whether `value` is a number within the given range and integer constraint.
 * @param min Minimum allowable value (inclusive). Omit to not perform a minimum check.
 * @param max Maximum allowable value (inclusive). Omit to not perform a maximum check.
 * @param integer `true` by default. Set to `false` to allow non-integer values.
 */
export function isNumberWithinRange(value: unknown, min?: number, max?: number, integer: boolean = true): value is number {
    if (typeof value !== "number" || Number.isNaN(value)) return false;
    if (integer && !Number.isInteger(value)) return false;
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
}

/**
 * Asserts that `value` is a number within the given range and integer constraint, throwing
 * {@link EvaluatorNumberRangeError} otherwise.
 * @param funcName The name of the function performing the check, used in the error message.
 * @param min Minimum allowable value (inclusive). Omit to not perform a minimum check.
 * @param max Maximum allowable value (inclusive). Omit to not perform a maximum check.
 * @param integer `true` by default. Set to `false` to allow non-integer values.
 * @param paramName The name of the parameter being checked, if available.
 */
export function assertNumberWithinRange(value: unknown, funcName: string, min?: number, max?: number, integer: boolean = true, paramName?: string): asserts value is number {
    if (!isNumberWithinRange(value, min, max, integer)) {
        throw new EvaluatorNumberRangeError(value, { min, max, integer }, funcName, paramName);
    }
}
