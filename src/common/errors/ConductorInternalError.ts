import { ConductorError } from "./ConductorError";
import { ErrorType } from "./ErrorType";

export class ConductorInternalError extends ConductorError {
    override name = "ConductorInternalError";
    override readonly errorType = ErrorType.INTERNAL;
    
    constructor(message: string) {
        super(message);
    }
}
