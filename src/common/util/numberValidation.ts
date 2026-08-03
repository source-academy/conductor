import { EvaluatorNumberRangeError } from "../errors/EvaluatorNumberRangeError";
import type { NumberRangeOptions } from "../errors/EvaluatorNumberRangeError";

/**
 * Checks whether `value` is a number within the given range and integer constraint.
 * `min`/`max` are inclusive unless `minExclusive`/`maxExclusive` are set. `integer` is `true`
 * by default; set to `false` to allow non-integer values.
 */
export function isNumberWithinRange(value: unknown, options?: NumberRangeOptions): value is number;
/** @deprecated Pass a {@link NumberRangeOptions} object instead - this positional form only exists for callers written before that option existed. */
export function isNumberWithinRange(value: unknown, min?: number, max?: number, integer?: boolean): value is number;
export function isNumberWithinRange(
    value: unknown,
    minOrOptions?: number | NumberRangeOptions,
    legacyMax?: number,
    legacyInteger?: boolean,
): value is number {
    const options: NumberRangeOptions =
        typeof minOrOptions === "number" || minOrOptions === undefined
            ? { min: minOrOptions, max: legacyMax, integer: legacyInteger }
            : minOrOptions;
    const { min, max, minExclusive, maxExclusive, integer = true } = options;
    if (typeof value !== "number" || Number.isNaN(value)) return false;
    if (integer && !Number.isInteger(value)) return false;
    if (minExclusive !== undefined ? value <= minExclusive : min !== undefined && value < min) return false;
    if (maxExclusive !== undefined ? value >= maxExclusive : max !== undefined && value > max) return false;
    return true;
}

/**
 * Asserts that `value` is a number within the given range and integer constraint, throwing
 * {@link EvaluatorNumberRangeError} otherwise.
 * @param funcName The name of the function performing the check, used in the error message.
 */
export function assertNumberWithinRange(value: unknown, funcName: string, options?: NumberRangeOptions & { paramName?: string }): asserts value is number;
/** @deprecated Pass a {@link NumberRangeOptions} object instead - this positional form only exists for callers written before that option existed. */
export function assertNumberWithinRange(value: unknown, funcName: string, min?: number, max?: number, integer?: boolean, paramName?: string): asserts value is number;
export function assertNumberWithinRange(
    value: unknown,
    funcName: string,
    minOrOptions?: number | (NumberRangeOptions & { paramName?: string }),
    legacyMax?: number,
    legacyInteger?: boolean,
    legacyParamName?: string,
): asserts value is number {
    const options: NumberRangeOptions & { paramName?: string } =
        typeof minOrOptions === "number" || minOrOptions === undefined
            ? { min: minOrOptions, max: legacyMax, integer: legacyInteger, paramName: legacyParamName }
            : minOrOptions;
    if (!isNumberWithinRange(value, options)) {
        throw new EvaluatorNumberRangeError(value, options, funcName, options.paramName);
    }
}
