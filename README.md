# idbc

A Class of IndexedDB wrapper

# Basic Usage

```tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Idb } from 'idbc';

const DB_NAME = 'IDBDemo';
const DB_STORE_NAME = 'IDBDemoStore';

interface IInfoItem {
  recordId: number;
  value?: string;
}

const IDBDemo = new Idb<{ [DB_STORE_NAME]: IInfoItem }>(DB_NAME, 1, [
  { storeName: DB_STORE_NAME, keyPath: 'recordId' },
]);

IDBDemo.add(DB_STORE_NAME, { recordId: Date.now(), value: 'value' });
```
