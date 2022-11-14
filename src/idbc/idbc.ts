import { getRandomString } from './utils';
import {KEY_PATH} from './consts'
import {IStoreOptions,TStringPropNames} from './type'

/**
 * A class of indexedDB wrapper.
 */
export class Idb<T extends { [p in string]: any }, K extends TStringPropNames<T> =  TStringPropNames<T> > {
  static KEY_PATH = KEY_PATH;

  constructor(dbName: string, dbVersion: number, storeOptions: IStoreOptions<K, T[K]>[]) {
    this.dbName = dbName;
    this.storeOptions = storeOptions;
    this.dbVersion = dbVersion;
    this.open().then(this.handleReady);
  }

  dbName: string;

  dbVersion: number;

  storeOptions: IStoreOptions<K, T[K]>[];
  
  private db?: IDBDatabase;

  private callbacksOfReady: Function[] = [];

  private handleReady = () => {
    while (this.callbacksOfReady.length) {
      const fn = this.callbacksOfReady.shift();
      fn!();
    }
  };

  /**
   * Open DB
   * @returns 
   */
  private open = () => {
    return new Promise<any>((resolve, reject) => {
      const { dbName, dbVersion } = this;

      const request = window.indexedDB.open(dbName, dbVersion);

      request.onsuccess = (event) => {
        this.db = request.result;
        resolve(event);
      };

      request.onupgradeneeded = () => {
        this.db = request.result;
        this.storeOptions.forEach(({ storeName, indexes,keyPath }) => {
          if (!this.db!.objectStoreNames.contains(storeName )) {
            const store = this.db!.createObjectStore(storeName , { keyPath:(keyPath ) ||  KEY_PATH });
            indexes?.forEach(({ name }) => {
              store.createIndex(name, name, { unique: false });
            });
          }
        });
      };
      request.onerror = reject;
    });
  };

  /**
   * Add a record
   * @param storeName 
   * @param record 
   * @returns 
   */
  add(storeName: K, record: T[K]): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const fn = () => {
        const storeOption = this.storeOptions.find(n=>n.storeName===storeName);
        if(
            !storeOption
        ){
            reject(new Error(`Can not add record to ${this.dbName}:${storeName }`))
            return
        }
        const {keyPath,} = storeOption;
        const key =keyPath ? record[keyPath] :  `${getRandomString()}_${Date.now()}`;
        
        const transaction = this.db!.transaction(storeName , 'readwrite');
        transaction.objectStore(storeName).put({ ...record, [keyPath || KEY_PATH]: key });
        transaction.oncomplete = () => {
          resolve(key);
        };
        transaction.onerror = reject;
      };

      if (this.db) {
        fn();
        return;
      }
      this.callbacksOfReady.push(fn);
    });
  }

  /**
   * Get records
   * @param storeName 
   * @returns 
   */
  getRecords(storeName: K,):Promise<T[K][]>{
    return new Promise<T[K][]>((resolve, reject) => {
      const fn = () => {
        const storeOption = this.storeOptions.find(n=>n.storeName===storeName);
         if(
            !storeOption
        ){
            reject(new Error(`Can not add record to ${this.dbName}:${storeName}`))
            return
        }
        const {keyPath,} = storeOption;
        
        const transaction = this.db!.transaction(storeName,'readonly');
        transaction.objectStore(storeName).getAll();
        transaction.oncomplete=(ev=>{
         resolve(ev.target!.result as T[K][]);
        });
        transaction.onerror=reject
      };

      if (this.db) {
        fn();
        return;
      }
      this.callbacksOfReady.push(fn);
    });
  }
}
