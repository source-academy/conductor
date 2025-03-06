import type { IHeapTypedValue } from "./IHeapTypedValue";

export interface IHeapEnvFrame {
    readonly label: string;
    readonly parent?: number;
    readonly names: string[];
    readonly bindings: Record<string, IHeapTypedValue>;
    readonly constant: Record<string, boolean>;
}
