import type ExternValue from "./ExternValue";

type ExternCallable = (...args: ExternValue[]) => ExternValue;

export type { ExternCallable as default };
