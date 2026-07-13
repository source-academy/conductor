import { EvaluatorParameterTypeError } from "./EvaluatorParameterTypeError";

/**
 * Evaluator callback error - a module function received a callback that either isn't a
 * function, or doesn't have the expected number of parameters.
 */
export class EvaluatorCallbackError extends EvaluatorParameterTypeError {
    override name = "EvaluatorCallbackError";

    constructor(expected: number | string, actual: unknown, funcName: string, paramName?: string, line?: number, column?: number, fileName?: string) {
        const expectedDescription = typeof expected === "number" ? `function with ${expected} parameter${expected === 1 ? "" : "s"}` : expected;
        super(funcName, paramName, expectedDescription, actual, line, column, fileName);
    }
}
