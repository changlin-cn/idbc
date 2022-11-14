import React, { useEffect, useMemo ,useState} from 'react';
import { Idb } from '../../src/index';



const DB_NAME = 'IDBDemo';
const DB_STORE_NAME = 'IDBDemoStore';



interface IInfoItem {
  recordId: number;
}

 const IDBDemo= new Idb<{ [DB_STORE_NAME]: IInfoItem }>(DB_NAME, 1, [
  { storeName: DB_STORE_NAME,keyPath:'recordId' },
]);

IDBDemo.add(DB_STORE_NAME, {recordId:Date.now() });

// window.IDBDemo = IDBDemo;


export default () =>{
    const [list,setList] = useState<IInfoItem[]>([])
    useEffect(()=>{
        IDBDemo
    },[])
    return 'hello'
};