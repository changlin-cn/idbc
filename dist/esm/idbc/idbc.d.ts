import { IStoreOptions, TStringPropNames } from './type';
/**
 * A class of indexedDB wrapper.
 */
export declare class Idb<T extends {
    [p in string]: any;
}, K extends TStringPropNames<T> = TStringPropNames<T>> {
    static KEY_PATH: string;
    constructor(dbName: string, dbVersion: number, storeOptions: IStoreOptions<K, T[K]>[]);
    dbName: string;
    dbVersion: number;
    storeOptions: IStoreOptions<K, T[K]>[];
    private db?;
    private callbacksOfReady;
    private handleReady;
    /**
     * Open DB
     * @returns
     */
    private open;
    /**
     * Add a record
     * @param storeName
     * @param record
     * @returns
     */
    add(storeName: K, record: T[K]): Promise<string>;
    /**
     * Get records
     * @param storeName
     * @returns
     */
    getRecords(storeName: K): Promise<T[K][]>;
}
