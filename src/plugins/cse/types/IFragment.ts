import type { ISourceLocation } from "./ISourceLocation";

export interface IFragment<F, L = ISourceLocation> {
    start: L;
    end: L;
    fragment: F;
}
