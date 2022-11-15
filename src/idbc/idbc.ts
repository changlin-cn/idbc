import { getRandomString } from './utils';
import { KEY_PATH } from './consts';
import { IStoreOptions, TStringPropNames } from './type';

/**
 * A class of indexedDB wrapper.
 */
export class Idb<
  T extends { [p in string]: any },
  K extends TStringPropNames<T> = TStringPropNames<T>,
  Opt extends IStoreOptions<K, T[K]> = IStoreOptions<K, T[K]>,
> {
  static KEY_PATH = KEY_PATH;

  constructor(dbName: string, dbVersion: number, storeOptions: Opt[]) {
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
        this.storeOptions.forEach(({ storeName, indexes, keyPath }) => {
          if (!this.db!.objectStoreNames.contains(storeName)) {
            const store = this.db!.createObjectStore(storeName, { keyPath: keyPath || KEY_PATH });
            indexes?.forEach(({ name }) => {
              store.createIndex(name, name, { unique: false });
            });
          }
        });
      };
      request.onerror = reject;
    });
  };

  private checkStoreExsit = (storeName: K) => {
    const storeOption = this.storeOptions.find((n) => n.storeName === storeName);
    if (!storeOption) {
      throw new Error(`${this.dbName}:${storeName} dose not exist.`);
    }
    return storeOption;
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
        const storeOption = this.checkStoreExsit(storeName);

        const { keyPath } = storeOption;
        const key = keyPath ? record[keyPath] : `${getRandomString()}_${Date.now()}`;

        const transaction = this.db!.transaction(storeName, 'readwrite');
        transaction.objectStore(storeName).add({ ...record, [keyPath || KEY_PATH]: key });
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
   * Get a record by key
   * @param storeName
   * @returns
   */
  getByKey(storeName: K, key: T[K][NonNullable<Opt['keyPath']>]): Promise<T[K]> {
    return new Promise<T[K]>((resolve, reject) => {
      const fn = () => {
        this.checkStoreExsit(storeName);

        const transaction = this.db!.transaction(storeName, 'readonly')
          .objectStore(storeName)
          .get(key);
        transaction.onsuccess = () => {
          // debugger
          resolve(transaction.result as T[K]);
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
   * Get all records
   * @param storeName
   * @returns
   */
  getAll(storeName: K): Promise<T[K][]> {
    return new Promise<T[K][]>((resolve, reject) => {
      const fn = () => {
        this.checkStoreExsit(storeName);

        const transaction = this.db!.transaction(storeName, 'readonly')
          .objectStore(storeName)
          .getAll();
        transaction.onsuccess = () => {
          // debugger
          resolve(transaction.result as T[K][]);
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
   * Add a record
   * @param storeName
   * @param record
   * @returns
   */
  put(storeName: K, record: T[K], key: T[K][NonNullable<Opt['keyPath']>]): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const fn = () => {
        this.checkStoreExsit(storeName);

        const transaction = this.db!.transaction(storeName, 'readwrite')
          .objectStore(storeName)
          .put({ ...record });

        transaction.onsuccess = () => {
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
   * Clear all records
   * @param storeName
   * @returns
   */
  delete(storeName: K, key: T[K][NonNullable<Opt['keyPath']>]): Promise<null> {
    return new Promise<null>((resolve, reject) => {
      const fn = () => {
        this.checkStoreExsit(storeName);

        const transaction = this.db!.transaction(storeName, 'readwrite')
          .objectStore(storeName)
          .delete(key);
        transaction.onsuccess = () => {
          // debugger
          resolve(null);
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
   * Clear all records
   * @param storeName
   * @returns
   */
  clear(storeName: K): Promise<null> {
    return new Promise<null>((resolve, reject) => {
      const fn = () => {
        this.checkStoreExsit(storeName);

        const transaction = this.db!.transaction(storeName, 'readwrite')
          .objectStore(storeName)
          .clear();
        transaction.onsuccess = () => {
          // debugger
          resolve(null);
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
}
