import { ConductorError } from "./ConductorError";
import { ErrorType } from "./ErrorType";

export class ConductorInternalError extends ConductorError {
    errorType = ErrorType.INTERNAL;
    
    constructor(message: string) {
        super(message);
    }
}
