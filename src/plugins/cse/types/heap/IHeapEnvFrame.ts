import type { ITypedValue } from "./ITypedValue";

export interface IHeapEnvFrame {
    readonly label: string;
    readonly parent?: number;
    readonly names: string[];
    readonly bindings: Record<string, ITypedValue>;
    readonly constant: Record<string, boolean>;
}
