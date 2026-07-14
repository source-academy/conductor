import { EvaluatorNumberRangeError } from "../errors/EvaluatorNumberRangeError";
import type { NumberRangeOptions } from "../errors/EvaluatorNumberRangeError";

/**
 * Checks whether `value` is a number within the given range and integer constraint.
 * `min`/`max` are inclusive unless `minExclusive`/`maxExclusive` are set. `integer` is `true`
 * by default; set to `false` to allow non-integer values.
 */
export function isNumberWithinRange(value: unknown, options: NumberRangeOptions = {}): value is number {
    const { min, max, minExclusive = false, maxExclusive = false, integer = true } = options;
    if (typeof value !== "number" || Number.isNaN(value)) return false;
    if (integer && !Number.isInteger(value)) return false;
    if (min !== undefined && (minExclusive ? value <= min : value < min)) return false;
    if (max !== undefined && (maxExclusive ? value >= max : value > max)) return false;
    return true;
}

/**
 * Asserts that `value` is a number within the given range and integer constraint, throwing
 * {@link EvaluatorNumberRangeError} otherwise.
 * @param funcName The name of the function performing the check, used in the error message.
 */
export function assertNumberWithinRange(value: unknown, funcName: string, options: NumberRangeOptions & { paramName?: string } = {}): asserts value is number {
    if (!isNumberWithinRange(value, options)) {
        throw new EvaluatorNumberRangeError(value, options, funcName, options.paramName);
    }
}
