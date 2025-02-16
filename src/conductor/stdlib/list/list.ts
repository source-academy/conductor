import { DataType, ExternValue, IDataHandler, List } from "../../types";

/**
 * Creates a new List from given elements.
 * @param elements The elements of the List, given as a tuple of [type, value].
 * @returns The newly created List.
 */
export function list(this: IDataHandler, ...elements: [DataType, ExternValue][]): List {
    let theList: List = null;
    for (let i = elements.length - 1; i >= 0; --i) {
        const p = this.pair_make();
        this.pair_sethead(p, ...elements[i]);
        this.pair_settail(p, theList === null ? DataType.EMPTY_LIST : DataType.PAIR, theList);
        theList = p;
    }
    return theList;
}
