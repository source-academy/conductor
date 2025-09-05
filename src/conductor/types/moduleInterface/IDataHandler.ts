import type { DataType, ExternCallable, IFunctionSignature, TypedValue } from ".";

export interface IDataHandler {
    readonly hasDataInterface: true;

    ///// Data Handling Functions

    /**
     * Makes a new Pair.
     * @param head The typed value to be the head of the new Pair.
     * @param tail The typed value to be the tail of the new Pair.
     * @returns A promise to a typed value to the new Pair.
     */
    pair_make(head: TypedValue<DataType>, tail: TypedValue<DataType>): Promise<TypedValue<DataType.PAIR>>;

    /**
     * Gets the typed value in the head of a Pair.
     * @param p The Pair to retrieve the head of.
     * @returns A promise to the typed value in the head of the Pair.
     */
    pair_head(p: TypedValue<DataType.PAIR>): Promise<TypedValue<DataType>>;

    /**
     * Sets the head of a Pair.
     * @param p The Pair to set the head of.
     * @param tv The typed value to set the head of the Pair to.
     * @returns A promise that resolves when the operation is complete.
     */
    pair_sethead(p: TypedValue<DataType.PAIR>, tv: TypedValue<DataType>): Promise<void>;

    /**
     * Gets the typed value in the tail of a Pair.
     * @param p The Pair to retrieve the tail of.
     * @returns A promise to the typed value in the tail of the Pair.
     */
    pair_tail(p: TypedValue<DataType.PAIR>): Promise<TypedValue<DataType>>;

    /**
     * Sets the tail of a Pair.
     * @param p The Pair to set the tail of.
     * @param tv The typed value to set the tail of the Pair to.
     * @returns A promise that resolves when the operation is complete.
     */
    pair_settail(p: TypedValue<DataType.PAIR>, tv: TypedValue<DataType>): Promise<void>;

    /**
     * Asserts the type of a Pair.
     * @param p The Pair to assert the type of.
     * @param headType The expected type of the head of the Pair.
     * @param tailType The expected type of the tail of the Pair.
     * @returns A promise that resolves when the operation is complete.
     * @throws If the Pair's type is not as expected.
     */
    pair_assert(p: TypedValue<DataType.PAIR>, headType?: DataType, tailType?: DataType): Promise<void>;

    /**
     * Makes a new Array.
     * 
     * Creation of untyped arrays (with type `VOID`) should be avoided.
     * @param t The type of the elements of the Array.
     * @param len The length of the Array.
     * @param init An optional initial typed value for the elements of the Array.
     * @returns A promise to a typed value to the new Array.
     */
    array_make<T extends DataType>(t: T, len: number, init?: TypedValue<NoInfer<T>>): Promise<TypedValue<DataType.ARRAY, NoInfer<T>>>;

    /**
     * Gets the length of an Array.
     * @param a The Array to retrieve the length of.
     * @returns A promise to the length of the given Array.
     */
    array_length(a: TypedValue<DataType.ARRAY>): Promise<number>;

    /**
     * Gets the typed value at a specific index of an Array.
     * Arrays are 0-indexed.
     * @param a The Array to retrieve the value from.
     * @param idx The index of the value wanted.
     * @returns A promise to the typed value at the given index of the given Array.
     * @throws If the Array does not contain the given index.
     */
    array_get(a: TypedValue<DataType.ARRAY, DataType.VOID>, idx: number): Promise<TypedValue<DataType>>;
    array_get<T extends DataType>(a: TypedValue<DataType.ARRAY, T>, idx: number): Promise<TypedValue<NoInfer<T>>>;

    /**
     * Gets the type of the elements of an Array.
     * 
     * If the Array is untyped, `VOID` is returned.
     * @param a The Array to retrieve the element type of.
     * @returns A promise to the type of the elements of the Array.
     */
    array_type<T extends DataType>(a: TypedValue<DataType.ARRAY, T>): Promise<NoInfer<T>>;

    /**
     * Sets a value at a specific index of an Array.
     * Arrays are 0-indexed.
     * @param a The Array to be modified.
     * @param idx The index to be modified.
     * @param tv The new typed value at the given index of the given Array.
     * @returns A promise that resolves when the operation is complete.
     * @throws If the Array does not contain the given index.
     * @throws If the Array is typed and tv's type does not match the Array's type.
     */
    array_set(a: TypedValue<DataType.ARRAY, DataType.VOID>, idx: number, tv: TypedValue<DataType>): Promise<void>;
    array_set<T extends DataType>(a: TypedValue<DataType.ARRAY, T>, idx: number, tv: TypedValue<NoInfer<T>>): Promise<void>;

    /**
     * Asserts the type and/or length of an Array.
     * @param a The Array to assert.
     * @param type The expected type of the elements of the Array.
     * @param length The expected length of the Array.
     * @returns A promise that resolves when the operation is complete.
     * @throws If the Array's type is not as expected.
     */
    array_assert<T extends DataType>(a: TypedValue<DataType.ARRAY>, type?: T, length?: number): Promise<void>;

    /**
     * Makes a new Closure.
     * @param sig The signature of the new Closure.
     * @param func A callback to be called when the Closure is called.
     * @param dependsOn An optional array of typed values the Closure will depend on.
     * @returns A promise to a typed value to the new Closure.
     */
    closure_make<const Arg extends readonly DataType[], const Ret extends DataType>(sig: IFunctionSignature<Arg, Ret>, func: ExternCallable<Arg, Ret>, dependsOn?: (TypedValue<DataType> | null)[]): Promise<TypedValue<DataType.CLOSURE, Ret>>;

    /**
     * Checks if a Closure accepts variable number of arguments.
     * @param c The Closure to check.
     * @returns A promise that resolves to `true` if the Closure accepts variable number of arguments.
     */
    closure_is_vararg(c: TypedValue<DataType.CLOSURE>): Promise<boolean>;

    /**
     * Gets the arity (number of parameters) of a Closure.
     * For vararg Closures, the arity is the minimum number of parameters required.
     * @param c The Closure to get the arity of.
     * @returns A promise to the arity of the Closure.
     */
    closure_arity(c: TypedValue<DataType.CLOSURE>): Promise<number>;

    /**
     * Calls a Closure and checks the type of the returned value.
     * @param c The Closure to be called.
     * @param args An array of typed arguments to be passed to the Closure.
     * @param returnType The expected type of the returned value.
     * @returns A promise to the returned typed value.
     */
    closure_call<T extends DataType>(c: TypedValue<DataType.CLOSURE, T>, args: TypedValue<DataType>[], returnType: T): Promise<TypedValue<NoInfer<T>>>;

    /**
     * Calls a Closure of known return type.
     * @param c The Closure to be called.
     * @param args An array of typed arguments to be passed to the Closure.
     * @returns A promise to the returned typed value.
     */
    closure_call_unchecked<T extends DataType>(c: TypedValue<DataType.CLOSURE, T>, args: TypedValue<DataType>[]): Promise<TypedValue<NoInfer<T>>>;

    /**
     * Asserts the arity of a Closure.
     * For vararg closures, checks if the given number of arguments is accepted.
     * @param c The Closure to assert the arity of.
     * @param arity The expected arity of the Closure.
     * @returns A promise that resolves when the operation is complete.
     * @throws If the Closure's arity is not as expected.
     */
    closure_arity_assert(c: TypedValue<DataType.CLOSURE>, arity: number): Promise<void>;

    /**
     * Makes a new Opaque object.
     * @param v The value to be stored under this Opaque object.
     * @param immutable Mark this Opaque object as immutable. Mutable Opaque objects are not rollback-friendly,
     * and evaluators should disable any rollback functionality upon receiving such an object.
     * @returns A promise to a typed value to the new Opaque object.
     */
    opaque_make(v: any, immutable?: boolean): Promise<TypedValue<DataType.OPAQUE>>;

    /**
     * Gets the value stored under an Opaque object.
     * @param o The Opaque object.
     * @returns A promise to the value stored under this new Opaque object.
     */
    opaque_get(o: TypedValue<DataType.OPAQUE>): Promise<any>;

    /**
     * Update the value stored under an Opaque object.
     * @param o The Opaque object.
     * @param v The new value to store under this Opaque object.
     * @returns A promise that resolves when the operation is complete.
     */
    opaque_update(o: TypedValue<DataType.OPAQUE>, v: any): Promise<void>;

    /**
     * Ties the lifetime of the dependee to the dependent.
     * @param dependent The object that requires the existence of the dependee.
     * @param dependee The object whose existence is required by the dependent.
     */
    tie(dependent: TypedValue<DataType>, dependee: TypedValue<DataType> | null): Promise<void>;

    /**
     * Unties the lifetime of the dependee from the dependent.
     * @param dependent The tied dependent object.
     * @param dependee The tied dependee object.
     */
    untie(dependent: TypedValue<DataType>, dependee: TypedValue<DataType> | null): Promise<void>;

    ///// Standard library functions

    list(...elements: TypedValue<DataType>[]): Promise<TypedValue<DataType.LIST>>;
    is_list(xs: TypedValue<DataType.LIST>): Promise<boolean>;
    list_to_vec(xs: TypedValue<DataType.LIST>): Promise<TypedValue<DataType>[]>;
    accumulate<T extends Exclude<DataType, DataType.VOID>>(op: TypedValue<DataType.CLOSURE, T>, initial: TypedValue<T>, sequence: TypedValue<DataType.LIST>, resultType: T): Promise<TypedValue<T>>;
    length(xs: TypedValue<DataType.LIST>): Promise<number>;
}
