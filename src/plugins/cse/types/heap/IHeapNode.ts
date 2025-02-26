import type { HeapData } from "./HeapData";
import type { HeapDataType } from "./HeapDataType";
import type { HeapIdentifier } from "./HeapIdentifier";

export interface IHeapNode {
    readonly type: HeapDataType;
    readonly value?: HeapData;
    readonly ref: ReadonlySet<HeapIdentifier>;
    readonly rc: 0;
}
