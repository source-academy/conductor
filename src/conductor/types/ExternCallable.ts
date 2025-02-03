import type { ExternValue } from "./ExternValue";

export type ExternCallable = (...args: ExternValue[]) => ExternValue;
