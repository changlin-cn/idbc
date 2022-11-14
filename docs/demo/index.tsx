import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Idb } from '../../src/index';

const DB_NAME = 'IDBDemo';
const DB_STORE_NAME = 'IDBDemoStore';

interface IInfoItem {
  recordId: number;
  value?: string;
}

const IDBDemo = new Idb<{ [DB_STORE_NAME]: IInfoItem }>(DB_NAME, 1, [
  { storeName: DB_STORE_NAME, keyPath: 'recordId' },
]);

export default () => {
  const [list, setList] = useState<IInfoItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleAdd = useCallback(() => {
    const v = inputRef.current?.value;
    IDBDemo.add(DB_STORE_NAME, { recordId: Date.now(), value: v }).then(() =>
      IDBDemo.getAll('IDBDemoStore').then(setList),
    );
  }, []);
  const handleDelete: React.MouseEventHandler<HTMLButtonElement> = useCallback((event) => {
    const id = event.target.getAttribute('data-id');

    if (id) {
      IDBDemo.delete('IDBDemoStore', Number(id)).then(() =>
        IDBDemo.getAll('IDBDemoStore').then(setList),
      );
    } else {
      IDBDemo.clear('IDBDemoStore').then(() => IDBDemo.getAll('IDBDemoStore').then(setList));
    }
  }, []);
  const handleUpdate: React.MouseEventHandler<HTMLButtonElement> = useCallback((event) => {
    const id = event.target.getAttribute('data-id');

    if (id) {
      IDBDemo.put('IDBDemoStore', { value: 'updated', recordId: Number(id) }, Number(id)).then(() =>
        IDBDemo.getAll('IDBDemoStore').then(setList),
      );
    }
  }, []);

  useEffect(() => {
    IDBDemo.getAll('IDBDemoStore').then(setList);
  }, []);
  return (
    <div>
      <div>
        <button onClick={handleDelete}>remove all</button>
      </div>
      <ul>
        {list.length > 0 &&
          list.map((n) => (
            <li key={n.recordId}>
              <button data-id={n.recordId} onClick={handleUpdate}>
                update
              </button>
              &nbsp;
              <button data-id={n.recordId} onClick={handleDelete}>
                remove
              </button>
              &nbsp; recordId:<b>{n.recordId}</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; value:
              <b>{n.value}</b>
            </li>
          ))}
        <li>
          <input ref={inputRef} /> <button onClick={handleAdd}>add</button>
        </li>
      </ul>
    </div>
  );
};
