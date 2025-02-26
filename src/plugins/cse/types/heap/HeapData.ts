import type { IHeapArray } from "./IHeapArray";
import type { IHeapClosure } from "./IHeapClosure";
import type { IHeapEnvFrame } from "./IHeapEnvFrame";
import type { IHeapOpaque } from "./IHeapOpaque";
import type { IHeapPair } from "./IHeapPair";

export type HeapData = IHeapArray | IHeapClosure | IHeapEnvFrame | IHeapOpaque | IHeapPair;
