import { DataType } from "../../conductor/types";
import { ConductorError } from "./ConductorError";
import { ErrorType } from "./ErrorType";

export class EvaluatorTypeError extends ConductorError {
    name = "EvaluatorTypeError";
    readonly errorType = ErrorType.TYPE;

    readonly expected: DataType;
    readonly actual: DataType;

    constructor(message: string, expected: DataType, actual: DataType) {
        super(`${message} (expected ${DataType[expected]}, got ${DataType[actual]})`);
        this.expected = expected;
        this.actual = actual;
    }
}
