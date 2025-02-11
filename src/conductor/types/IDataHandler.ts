import type { ArrayIdentifier, ClosureIdentifier, DataType, ExternCallable, ExternValue, Identifier, IFunctionSignature, OpaqueIdentifier, PairIdentifier } from ".";

export interface IDataHandler {
    readonly hasDataInterface: true;

    /**
     * Makes a new Pair.
     * @returns An identifier to the new Pair.
     */
    pair_make(): Identifier; // not PairIdentifier so evaluators do not need to cast

    /**
     * Gets the value in the head of a Pair.
     * @param p The Pair to retrieve the head of.
     * @returns The value in the head of the Pair.
     */
    pair_gethead(p: PairIdentifier): ExternValue;

    /**
     * Gets the type of the head of a Pair.
     * @param p The Pair to retrieve the head type of.
     * @returns The type of the head of the Pair.
     */
    pair_typehead(p: PairIdentifier): DataType;

    /**
     * Sets the head of a Pair.
     * @param p The Pair to set the head of.
     * @param t The type of the value to be set.
     * @param v The value to set the head of the Pair to.
     */
    pair_sethead(p: PairIdentifier, t: DataType, v: ExternValue): void;

    /**
     * Gets the value in the tail of a Pair.
     * @param p The Pair to retrieve the tail of.
     * @returns The value in the tail of the Pair.
     */
    pair_gettail(p: PairIdentifier): ExternValue;

    /**
     * Gets the type of the tail of a Pair.
     * @param p The Pair to retrieve the tail type of.
     * @returns The type of the tail of the Pair.
     */
    pair_typetail(p: PairIdentifier): DataType;

    /**
     * Sets the tail of a Pair.
     * @param p The Pair to set the tail of.
     * @param t The type of the value to be set.
     * @param v The value to set the tail of the Pair to.
     */
    pair_settail(p: PairIdentifier, t: DataType, v: ExternValue): void;

    /**
     * Makes a new Array.
     * @param t The type of the elements of the Array
     * @param len The length of the Array
     * @param init An optional initial value for the elements of the Array
     * @returns An identifier to the new Array.
     */
    array_make(t: DataType, len: number, init?: ExternValue): Identifier; // not ArrayIdentifier

    /**
     * Gets the length of an Array.
     * @param a The Array to retrieve the length of.
     * @returns The length of the given Array.
     */
    array_length(a: ArrayIdentifier): number;

    /**
     * Gets the value at a specific index of an Array.
     * Arrays are 0-indexed.
     * @param a The Array to retrieve the value from.
     * @param idx The index of the value wanted.
     * @returns The value at the given index of the given Array.
     */
    array_get(a: ArrayIdentifier, idx: number): ExternValue;

    /**
     * Gets the type of the elements of an Array.
     * @param a The Array to retrieve the element type of.
     * @returns The type of the elements of the Array.
     */
    array_type(a: ArrayIdentifier): DataType;

    /**
     * Sets a value at a specific index of an Array.
     * Arrays are 0-indexed.
     * @param a The Array to be modified.
     * @param idx The index to be modified.
     * @param v The new value at the given index of the given Array.
     */
    array_set(a: ArrayIdentifier, idx: number, v: ExternValue): void;

    /**
     * Makes a new Closure.
     * @param sig The signature of the new Closure.
     * @param func A callback to be called when the Closure is called.
     * @param dependsOn An optional array of Identifiers the Closure will depend on.
     * @returns An identifier to the new Closure.
     */
    closure_make(sig: IFunctionSignature, func: ExternCallable, dependsOn?: Identifier[]): Identifier; // not ClosureIdentifier

    /**
     * Calls a Closure.
     * @param c The Closure to be called.
     * @param args An array of arguments to be passed to the Closure.
     */
    closure_call(c: ClosureIdentifier, args: ExternValue[]): ExternValue;

    /**
     * Makes a new Opaque object.
     * @param v The value to be stored under this Opaque object.
     * @returns An identifier to the new Opaque object.
     */
    opaque_make(v: any): Identifier; // not OpaqueIdentifier

    /**
     * Gets the value stored under an Opaque object.
     * @param o The identifier to the new Opaque object.
     * @returns The value stored under this new Opaque object.
     */
    opaque_get(o: OpaqueIdentifier): any;

    /**
     * Ties the lifetime of the dependee to the dependent.
     * @param dependent The object that requires the existence of the dependee.
     * @param dependee The object whose existence is required by the dependent.
     */
    tie(dependent: Identifier, dependee: Identifier): void;
    
    /**
     * Unties the lifetime of the dependee from the dependent.
     * @param dependent The tied dependent object.
     * @param dependee The tied dependee object.
     */
    untie(dependent: Identifier, dependee: Identifier): void;
}
