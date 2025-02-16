export type Remote<IOther> = {
    [K in keyof IOther]: IOther[K] extends (...args: infer Args) => infer Ret
        ? Ret extends Promise<any>
            ? IOther[K]
            : (...args: Args) => Promise<Ret>
        : never
}
