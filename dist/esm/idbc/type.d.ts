export declare type TStringPropNames<T> = Exclude<keyof T, symbol | number>;
export interface IStoreOptions<N, R> {
    storeName: N;
    keyPath?: TStringPropNames<R>;
    indexes?: {
        name: TStringPropNames<R>;
    }[];
}
