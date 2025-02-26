import type { Control } from "./Control";
import type { IHeapNode, HeapIdentifier, ITypedValue, HeapData, IHeapEnvFrame, HeapDataType } from "./heap";
import type { ICseInstruction } from "./ICseInstruction";
import type { Stash } from "./Stash";

export interface ICseMachineState {

    ///// CONTROL

    /** The Control of the CSE machine. */
    readonly control: Control;

    readonly currentInstr: ICseInstruction | undefined;

    ///// STASH

    /** The Stash of the CSE machine. */
    readonly stash: Stash;

    ///// ENVIRONMENT

    /** The heap of the CSE machine. */
    readonly heap: readonly IHeapNode[];

    /** Freed identifiers to be recycled on alloc. */
    readonly recycleQueue: readonly HeapIdentifier[];

    /** The current frame in the Environment of the CSE machine. */
    readonly currentFrame: HeapIdentifier;

    ///// CONTROL

    /**
     * Adds items to the Control.
     * @param items The items to add to the Control.
     * @throws If not called on a Draft.
     */
    controlPush(items: ICseInstruction[]): void;

    /**
     * Adds an item to the Control.
     * @param item The item to add to the Control.
     * @throws If not called on a Draft.
     */
    controlPush(item: ICseInstruction): void;

    /**
     * Gets the next item in the Control.
     * @returns The next item in the Control, or undefined if the Control is empty.
     */
    controlTop(): ICseInstruction | undefined;

    /**
     * Removes the next item from the Control and returns it.
     * @returns The next item in the Control, or undefined if the Control is empty.
     * @throws If not called on a Draft.
     */
    controlPop(): ICseInstruction | undefined;

    /**
     * Clears the Control.
     * @throws If not called on a Draft.
     */
    controlClear(): void;

    /**
     * Sets an instruction as the current instruction.
     * @param instr The instruction to be set as the current instruction.
     * @throws If not called on a Draft.
     */
    setCurrentInstr(instr: ICseInstruction | undefined): void;

    ///// STASH

    /**
     * Adds items to the Stash.
     * @param items The items to add to the Stash.
     */
    stashPush(items: ITypedValue[]): void;

    /**
     * Adds an item to the Stash.
     * @param item The item to add to the Stash.
     */
    stashPush(item: ITypedValue): void;

    /**
     * Gets the next `numItems` items in the Stash, in the order they were inserted.
     * @param numItems The number of items to get.
     * @returns The next `numItems` items in the Stash.
     * @throws If there are insufficient items in the Stash.
     */
    stashTop(numItems: number): ITypedValue[];

    /**
     * Gets the next item in the Stash.
     * @returns The next item in the Stash.
     */
    stashTop(): ITypedValue | undefined;

    /**
     * Removes the next `numItems` items from the Stash, and returns them.
     * @param numItems The number of items to remove.
     * @returns The next `numItems` items in the Stash.
     * @throws If there are insufficient items in the Stash.
     * @throws If not called on a Draft.
     */
    stashPop(numItems: number): ITypedValue[];

    /**
     * Removes the next item from the Stash, and returns it.
     * @returns The next item in the Stash.
     * @throws If the Stash is empty.
     * @throws If not called on a Draft.
     */
    stashPop(): ITypedValue;

    /**
     * Clears the Stash.
     * @throws If not called on a Draft.
     */
    stashClear(): void;

    ///// ENVIRONMENT

    /**
     * Gets a value from the heap.
     * @param i The identifier to get the value of.
     * @returns The retrieved value.
     * @throws If the identifier is invalid.
     */
    heapGet(i: HeapIdentifier): HeapData;
    
    /**
     * Allocates an identifier to a piece of data.
     * @param type The type of data to be allocated.
     * @param value The data to be allocated.
     * @returns The allocated identifier.
     * @throws If not called on a Draft.
     */
    alloc(type: HeapDataType, value: HeapData): HeapIdentifier;

    /**
     * Increments the reference counter of a given identifier.
     * @param i The identifier to increment the reference counter of.
     * @throws If not called on a Draft.
     */
    incrementRef(i: HeapIdentifier): void;

    /**
     * Decrements the reference counter of a given identifier.
     * @param i The identifier to decrement the reference counter of.
     * @throws If not called on a Draft.
     */
    decrementRef(i: HeapIdentifier): void;

    /**
     * Processes all dereferences in a CSE step.
     * Reference counters will not be updated without this call.
     * 
     * When an identifier's reference counter reaches 0, it may be freed.
     * 
     * Warning: calling this function in the middle of a step may lead to freeing of
     * references that are in use.
     * @throws If not called on a Draft.
     */
    processStepDerefs(): void;

    /**
     * Ties the lifetime of the dependee to the dependent.
     * @param dependent The object that requires the existence of the dependee.
     * @param dependee The object whose existence is required by the dependent.
     * @throws If not called on a Draft.
     */
    tie(dependent: HeapIdentifier, dependee: HeapIdentifier): void;

    /**
     * Unties the lifetime of the dependee from the dependent.
     * @param dependent The tied dependent object.
     * @param dependee The tied dependee object.
     * @throws If not called on a Draft.
     */
    untie(dependent: HeapIdentifier, dependee: HeapIdentifier): void;

    /**
     * Frees the given objects, if their reference counter is zero.
     * 
     * If an object would no longer be depended on to as a result of freeing
     * its last dependent, then it will also be freed.
     * 
     * @param toClean The objects to clean up.
     * @throws If not called on a Draft.
     */
    clean(toClean: HeapIdentifier[]): void;

    /**
     * Frees all objects with a reference counter of zero.
     * 
     * If an object would no longer be depended on to as a result of freeing
     * its last dependent, then it will also be freed.
     * 
     * @throws If not called on a Draft.
     */
    clean(): void;

    /**
     * Frees objects using the mark-sweep garbage-collection strategy.
     * 
     * The roots are: Control, Stash, Global frame, Program frame, Current frame.
     * 
     * Note: Reference counts across all heap objects will be recomputed.
     * 
     * @throws If not called on a Draft.
     */
    markSweep(): void;

    /**
     * Gets the current Environment frame.
     * @returns The current Environment frame.
     */
    getFrame(): IHeapEnvFrame;

    /**
     * Gets an Environment frame by identifier.
     * @param frameId The identifier pointing to the frame to be retrieved.
     * @returns The retrieved Environment frame.
     */
    getFrame(frameId: HeapIdentifier): IHeapEnvFrame;

    /**
     * Finds the closest parent to the current frame containing the given symbol.
     * @param name The symbol to find the closest containing frame of.
     * @returns An identifier to the frame, or undefined if no such frame exists.
     */
    findFrame(name: string): HeapIdentifier | undefined;

    /**
     * Finds the closest parent to the given frame containing the given symbol.
     * @param name The symbol to find the closest containing frame of.
     * @param frameId The identifier pointing to the frame to commence the search from.
     * @returns An identifier to the frame, or undefined if no such frame exists.
     */
    findFrame(name: string, frameId: HeapIdentifier): HeapIdentifier | undefined;

    /**
     * Creates a new Environment frame, and sets it as the current frame.
     * @param label The label of the frame.
     * @param names The symbols defined in this frame.
     * @param bindings A record mapping symbols to their corresponding values.
     * @param parent The parent of the new frame.
     * @throws If not called on a Draft.
     */
    makeFrame(label: string, names?: string[], bindings?: Record<string, ITypedValue>, parent?: HeapIdentifier): void;

    /**
     * Sets a given frame as the current frame.
     * @param frameId The identifier pointing to the frame to be set as the current frame.
     * @throws If not called on a Draft.
     */
    setCurrentFrame(frameId: HeapIdentifier): void;

    /**
     * Looks up the value of a given symbol, starting from the current frame.
     * @param name The symbol to lookup the value of.
     */
    lookup(name: string): ITypedValue;

    /**
     * Looks up the value of a given symbol, starting from a given frame.
     * @param name The symbol to lookup the value of.
     * @param frameId The identifier pointing to the frame to commence the search from.
     */
    lookup(name: string, frameId: HeapIdentifier): ITypedValue;

    /**
     * Modifies the value of a given symbol, resolving the symbol starting from the current frame.
     * @param name The symbol to modify the value of.
     * @param newValue The new value to be taken by the symbol.
     */
    modify(name: string, newValue: ITypedValue): void;

    /**
     * Modifies the value of a given symbol, resolving the symbol starting from the given frame.
     * @param name The symbol to modify the value of.
     * @param newValue The new value to be taken by the symbol.
     * @param frameId The identifier pointing to the frame to commence the search from.
     */
    modify(name: string, newValue: ITypedValue, frameId: HeapIdentifier): void;
}
