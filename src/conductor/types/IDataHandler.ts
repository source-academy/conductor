import type { ArrayIdentifier, ClosureIdentifier, DataType, ExternCallable, ExternTypeOf, ExternValue, Identifier, IFunctionSignature, List, OpaqueIdentifier, PairIdentifier, ReturnValue } from ".";
import { stdlib } from "../stdlib";

export interface IDataHandler {
    readonly hasDataInterface: true;

    ///// Data Handling Functions

    /**
     * Makes a new Pair.
     * @returns An identifier to the new Pair.
     */
    pair_make(): PairIdentifier;

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
     * Asserts the type of a Pair.
     * @param p The Pair to assert the type of.
     * @param headType The expected type of the head of the Pair.
     * @param tailType The expected type of the tail of the Pair.
     * @throws If the Pair's type is not as expected.
     */
    pair_assert(p: PairIdentifier, headType?: DataType, tailType?: DataType): boolean;

    /**
     * Makes a new Array.
     * @param t The type of the elements of the Array
     * @param len The length of the Array
     * @param init An optional initial value for the elements of the Array
     * @returns An identifier to the new Array.
     */
    array_make(t: DataType, len: number, init?: ExternValue): ArrayIdentifier;

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
     * Asserts the type of an Array.
     * @param a The Array to assert the type of.
     * @param type The expected type of the elements of the Array.
     * @param length The expected length of the Array.
     * @throws If the Array's type is not as expected.
     */
    array_assert(a: ArrayIdentifier, type?: DataType, length?: number): boolean;

    /**
     * Makes a new Closure.
     * @param sig The signature of the new Closure.
     * @param func A callback to be called when the Closure is called.
     * @param dependsOn An optional array of Identifiers the Closure will depend on.
     * @returns An identifier to the new Closure.
     */
    closure_make<const T extends IFunctionSignature>(sig: T, func: ExternCallable<T>, dependsOn?: (Identifier | null)[]): ClosureIdentifier<T["returnType"]>;

    /**
     * Gets the arity (number of parameters) of a Closure.
     * @param c The Closure to get the arity of.
     * @returns The arity of the Closure.
     */
    closure_arity(c: ClosureIdentifier<DataType>): number;

    /**
     * Calls a Closure.
     * @param c The Closure to be called.
     * @param args An array of arguments to be passed to the Closure.
     * @returns A tuple of the returned value, and its type.
     */
    closure_call<T extends DataType>(c: ClosureIdentifier<T>, args: ExternValue[]): ReturnValue<NoInfer<T>>;

    /**
     * Gets the value of a return.
     * @param rv The Closure-returned value to extract the value from.
     * @returns The return value.
     */
    closure_returnvalue<T extends DataType>(rv: ReturnValue<T>): ExternTypeOf<T>;

    /**
     * Gets the value of a return, and checks its type.
     * @param rv The Closure-returned value to extract the value from.
     * @param type The expected type of the Closure-returned value.
     * @returns The return value.
     * @throws If the Closure-returned value's type is not as expected.
     */
    closure_returnvalue_checked<T extends DataType>(rv: ReturnValue<any>, type: T): ExternTypeOf<T>;

    /**
     * Asserts the arity of a Closure.
     * @param c The Closure to assert the arity of.
     * @param arity The expected arity of the Closure.
     * @throws If the Closure's arity is not as expected.
     */
    closure_arity_assert(c: ClosureIdentifier<DataType>, arity: number): boolean;

    /**
     * Asserts the type of a Closure-returned value.
     * @param rv The Closure-returned value to assert the type of.
     * @param type The expected type of the Closure-returned value.
     * @throws If the Closure-returned value's type is not as expected.
     */
    closure_returntype_assert<T extends DataType>(rv: ReturnValue<T>, type: T): asserts rv is ReturnValue<T>;

    /**
     * Makes a new Opaque object.
     * @param v The value to be stored under this Opaque object.
     * @returns An identifier to the new Opaque object.
     */
    opaque_make(v: any): OpaqueIdentifier;

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
    tie(dependent: Identifier, dependee: Identifier | null): void;

    /**
     * Unties the lifetime of the dependee from the dependent.
     * @param dependent The tied dependent object.
     * @param dependee The tied dependee object.
     */
    untie(dependent: Identifier, dependee: Identifier | null): void;

    ///// Standard library functions

    is_list(xs: List): boolean;
    accumulate<T extends Exclude<DataType, DataType.VOID>>(resultType: T, op: ClosureIdentifier<DataType>, initial: ExternTypeOf<T>, sequence: List): ExternTypeOf<T>;
    length(xs: List): number;
}
