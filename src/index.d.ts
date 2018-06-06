
declare module "redux-persist" {
    export * from "redux-persist/es/constants";
    export * from "redux-persist/es/types";
    export * from "redux-persist/es/createMigrate";
    export * from "redux-persist/es/createPersistoid";
    export * from "redux-persist/es/createTransform";
    export * from "redux-persist/es/createWebStorage";
    export * from "redux-persist/es/getStoredState";
    export * from "redux-persist/es/persistCombineReducers";
    export * from "redux-persist/es/persistReducer";
    export * from "redux-persist/es/persistStore";
    export * from "redux-persist/es/purgeStoredState";
}

declare module "redux-persist/lib/storage" {
    export { default } from "redux-persist/es/storage";
}

declare module "redux-persist/lib/storage/session" {
    export { default } from "redux-persist/es/storage/session";
}

declare module "redux-persist/lib/constants" {
    export * from "redux-persist/es/constants";
}

declare module "redux-persist/lib/types" {
    export * from "redux-persist/es/types";
}

declare module "redux-persist/lib/createMigrate" {
    export * from "redux-persist/es/createMigrate";
}

declare module "redux-persist/lib/createPersistoid" {
    export * from "redux-persist/es/createPersistoid";
}

declare module "redux-persist/lib/createTransform" {
    export * from "redux-persist/es/createTransform";
}

declare module "redux-persist/lib/createWebStorage" {
    export * from "redux-persist/es/createWebStorage";
}

declare module "redux-persist/lib/getStoredState" {
    export * from "redux-persist/es/getStoredState";
}

declare module "redux-persist/lib/persistCombineReducers" {
    export * from "redux-persist/es/persistCombineReducers";
}

declare module "redux-persist/lib/persistReducer" {
    export * from "redux-persist/es/persistReducer";
}

declare module "redux-persist/lib/persistStore" {
    export * from "redux-persist/es/persistStore";
}

declare module "redux-persist/lib/purgeStoredState" {
    export * from "redux-persist/es/purgeStoredState";
}

declare module "redux-persist/integration/react" {
    import { ReactNode, PureComponent } from "react";
    import { Persistor, WebStorage } from "redux-persist";

    /**
     * Properties of @see PersistGate
     */
    export interface PersistGateProps {
        persistor: Persistor;
        onBeforeLift?: Function;
        children?: ReactNode;
        loading?: ReactNode;
    }
    /**
     * State of @see PersistGate
     */
    export interface PersistorGateState { bootstrapped: boolean; }
    /**
     * Entry point of your react application to allow it persist a given store @see Persistor and its configuration.
     * @see Persistor
     * @see PersistGateProps
     * @see PersistGateState
     */
    export class PersistGate extends React.PureComponent<PersistGateProps, PersistorGateState> { }
}

declare module "redux-persist/es/constants" {
    /* constants */
    export const DEFAULT_VERSION: number;
    export const KEY_PREFIX: "persist:";
    export const FLUSH: "persist/FLUSH";
    export const REHYDRATE: "persist/REHYDRATE";
    export const PAUSE: "persist/PAUSE";
    export const PERSIST: "persist/PERSIST";
    export const PURGE: "persist/PURGE";
    export const REGISTER: "persist/REGISTER";
}

declare module "redux-persist/es/types" {
    import { StoreEnhancer } from "redux";
    import { Transform } from "redux-persist/es/createTransform"
    /* types */
    export interface PersistState { version: number; rehydrated: boolean; }
    export interface PersistedState { _persist?: PersistState }

    export interface PersistConfig {
        version?: number;
        storage: WebStorage | AsyncStorage | LocalForageStorage | Storage;
        key: string;
        /**
         * **Depricated:** keyPrefix is going to be removed in v6.
         */
        keyPrefix?: string;
        blacklist?: Array<string>;
        whitelist?: Array<string>;
        transforms?: Array<Transform<any, any>>;
        throttle?: number;
        migrate?: (state: PersistedState, versionKey: number) => Promise<PersistedState>;
        stateReconciler?: false | Function;
        /**
         * Used for migrations.
         */
        getStoredState?: (config: PersistConfig) => Promise<PersistedState>;
        debug?: boolean;
        serialize?: boolean;
        timeout?: number;
    }
    export interface PersistorOptions { enhancer?: StoreEnhancer<any> }
    export interface MigrationManifest {
        [key: string]: (state: PersistedState) => PersistedState;
    }
    export type RehydrateErrorType = any;
    export type RehydrateAction<Payload = any> = {
        type: "redux-persist/es/REHYDRATE",
        key: string,
        payload?: Payload,
        err?: RehydrateErrorType,
    }
    export interface Persistoid {
        update(item: any): void;
        flush(): Promise<any>;
    }
    export type RegisterAction = {
        type: "redux-persist/es/REGISTER",
        key: string,
    }
    export type PersistorAction = RehydrateAction | RegisterAction
    export interface PersistorState {
        registry: Array<string>;
        bootstrapped: boolean;
    }
    export type PersistorSubscribeCallback = () => any
    /**
     * A persistor is a redux store unto itself, allowing you to purge stored state, flush all
     * pending state serialization and immediately write to disk
     */
    export interface Persistor {
        pause(): void;
        persist(): void;
        purge(): Promise<any>;
        flush(): Promise<any>;
        dispatch(action: PersistorAction): PersistorAction;
        getState(): PersistorState;
        subscribe(callback: PersistorSubscribeCallback): () => any;
    }
    /* storage types */
    export interface WebStorage {
        /**
         * Fetches key and returns item in a promise.
         */
        getItem(key: string): Promise<string>;
        /**
         * Sets value for key and returns item in a promise.
         */
        setItem(key: string, item: string): Promise<string>;
        /**
         * Removes value for key.
         */
        removeItem(key: string): Promise<void>;
    }
    /**
     * User for local storage in react-native.
     *
     * AsyncStorage is a simple, unencrypted, asynchronous, persistent, key-value storage
     * system that is global to the app.  It should be used instead of LocalStorage.
     *
     * It is recommended that you use an abstraction on top of `AsyncStorage`
     * instead of `AsyncStorage` directly for anything more than light usage since
     * it operates globally.
     *
     * On iOS, `AsyncStorage` is backed by native code that stores small values in a
     * serialized dictionary and larger values in separate files. On Android,
     * `AsyncStorage` will use either [RocksDB](http://rocksdb.org/) or SQLite
     * based on what is available.
     *
     * The definition obtained from
     * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-native/index.d.ts
     */
    export interface AsyncStorage {
        /**
         * Fetches key and passes the result to callback, along with an Error if there is any.
         */
        getItem(key: string, callback?: (error?: Error, result?: string) => void): Promise<string>;
        /**
         * Sets value for key and calls callback on completion, along with an Error if there is any.
         */
        setItem(key: string, value: string, callback?: (error?: Error) => void): Promise<void>;
        /**
         * Removes value for key and calls callback on completion, along with an Error if there is any.
         */
        removeItem(key: string, callback?: (error?: Error) => void): Promise<void>;
        /**
         * Merges existing value with input value, assuming they are stringified json. Returns a Promise object.
         * Not supported by all native implementation
         */
        mergeItem(key: string, value: string, callback?: (error?: Error) => void): Promise<void>;
        /**
         * Erases all AsyncStorage for all clients, libraries, etc. You probably don't want to call this.
         * Use removeItem or multiRemove to clear only your own keys instead.
         */
        clear(callback?: (error?: Error) => void): Promise<void>;
        /**
         * Gets all keys known to the app, for all callers, libraries, etc
         */
        getAllKeys(callback?: (error?: Error, keys?: string[]) => void): Promise<string[]>;
        /**
         * multiGet invokes callback with an array of key-value pair arrays that matches the input format of multiSet
         */
        multiGet(keys: string[], callback?: (errors?: Error[], result?: [string, string][]) => void): Promise<[string, string][]>;
        /**
         * multiSet and multiMerge take arrays of key-value array pairs that match the output of multiGet,
         *
         * multiSet([['k1', 'val1'], ['k2', 'val2']], cb);
         */
        multiSet(keyValuePairs: string[][], callback?: (errors?: Error[]) => void): Promise<void>;
        /**
         * Delete all the keys in the keys array.
         */
        multiRemove(keys: string[], callback?: (errors?: Error[]) => void): Promise<void>;
        /**
         * Merges existing values with input values, assuming they are stringified json.
         * Returns a Promise object.
         *
         * Not supported by all native implementations.
         */
        multiMerge(keyValuePairs: string[][], callback?: (errors?: Error[]) => void): Promise<void>;
    }
    /**
     * LocalForage: Offline storage, improved. Wraps IndexedDB, WebSQL or localStorage using a simple
     * but powerful API.
     *
     * The type definition was obtained from:
     * @see https://github.com/localForage/localForage/blob/master/typings/localforage.d.ts
     */
    export interface LocalForageStorage {
        getItem<T>(key: string, callback?: (err: any, value: T) => void): Promise<T>;
        setItem<T>(key: string, value: T, callback?: (err: any, value: T) => void): Promise<T>;
        removeItem(key: string, callback?: (err: any) => void): Promise<void>;
        clear(callback?: (err: any) => void): Promise<void>;
        length(callback?: (err: any, numberOfKeys: number) => void): Promise<number>;
        key(keyIndex: number, callback?: (err: any, key: string) => void): Promise<string>;
        keys(callback?: (err: any, keys: string[]) => void): Promise<string[]>;
        iterate<T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U, callback?: (err: any, result: U) => void): Promise<U>;
    }
    export interface Storage {
        getItem(key: string, ...args: any[]): any;
        setItem(key: string, value: any, ...args: any[]): any;
        removeItem(key: string, ...args: any[]): any;
    }
}

declare module "redux-persist/es/createMigrate" {
    import { PersistedState, MigrationManifest } from "redux-persist/es/types";
    // createMigrate
    /**
     * Migration configutation
     */
    export interface MigrationConfig { debug: boolean; }
    export type MigrationDispatch = (state: PersistedState, currentVersion: number) => Promise<PersistedState>;
    /**
     * Creates a migration path for your app's state.
     * @param migrations migration manifest
     * @param config migration configuration (basically, indicates if you are running in debug mode or not)
     */
    export function createMigrate(migrations: MigrationManifest, config?: MigrationConfig): MigrationDispatch;
}

declare module "redux-persist/es/createPersistoid" {
    import { PersistConfig, Persistoid } from "redux-persist/es/types";
    // createPersistoid
    export function createPersistoid(config: PersistConfig): Persistoid;
}

declare module "redux-persist/es/createTransform" {
    import { PersistConfig } from "redux-persist/es/types";

    export type TransformIn<S, R> = (state: S, key: string) => R;
    export type TransformOut<R, S> = (raw: R, key: string) => S;

    export interface Transform<S, R> {
        in: TransformIn<S, R>;
        out: TransformOut<R, S>;
        config?: PersistConfig;
    }

    export function createTransform<S, R>(
        inbound: TransformIn<S, R>,
        outbound: TransformOut<R, S>,
        config?: Pick<PersistConfig, "whitelist" | "blacklist">
    ): Transform<S, R>;
}

declare module "redux-persist/es/createWebStorage" {
    import { WebStorage } from "redux-persist/es/types";
    export function createWebStorage(type: string): WebStorage;
}

declare module "redux-persist/es/getStoredState" {
    import { PersistConfig } from "redux-persist/es/types";
    export function getStoredState(config: PersistConfig): Promise<any | void>;
}

declare module "redux-persist/es/persistCombineReducers" {
    import { Reducer, ReducersMapObject } from "redux";
    import { PersistConfig, PersistedState } from "redux-persist/es/types";
    /**
     * It provides a way of combining the reducers, replacing redux's @see combineReducers
     * @param config persistence configuration
     * @param reducers set of keyed functions mapping to the application state
     * @returns reducer
     */
    export function persistCombineReducers<S>(config: PersistConfig, reducers: ReducersMapObject): Reducer<S & PersistedState>;
}

declare module "redux-persist/es/persistReducer" {
    import { PersistState, PersistConfig } from "redux-persist/es/types";
    import { Reducer, Action } from "redux";
    // persistReducer
    export interface PersistPartial { _persist: PersistState }
    /**
     * It provides a way of combining the reducers, replacing redux's @see combineReducers
     * @param config persistence configuration
     * @param baseReducer reducer used to persist the state
     */
    export function persistReducer<S, A extends Action>(config: PersistConfig, baseReducer: Reducer<S, A>): Reducer<S & PersistPartial, A>;
}
declare module "redux-persist/es/persistStore" {
    import { PersistorOptions, Persistor } from "redux-persist/es/types";
    // persistStore
    export type BoostrappedCallback = () => any;
    /**
     * Creates a persistor for a given store.
     * @param store store to be persisted (or match an existent storage)
     * @param persistorOptions enhancers of the persistor
     * @param callback bootstrap callback of sort.
     */
    export function persistStore(store: any, persistorOptions?: PersistorOptions, callback?: BoostrappedCallback): Persistor;
}

declare module "redux-persist/es/purgeStoredState" {
    import { PersistConfig } from "redux-persist/es/types";
    /**
     * Removes stored state.
     * @param config persist configuration
     */
    export function purgeStoredState(config: PersistConfig): any;
}

declare module "redux-persist/es/integration/getStoredStateMigrateV4" {
    import { PersistConfig, Transform } from "redux-persist";

    export interface V4Config {
        storage?: any;
        keyPrefix?: string;
        transforms?: Array<Transform<any, any>>;
        blacklist?: string[];
        whitelist?: string[];
    }

    export function getStoredState(v4Config: V4Config): (config: PersistConfig) => Promise<any | void>;
}

declare module "redux-persist/es/stateReconciler/autoMergeLevel1" {
    import { PersistConfig } from "redux-persist";
    export default function autoMergeLevel1<S>(inboundState: S, originalState: S, reducedState: S, { debug }: PersistConfig): S;
}

declare module "redux-persist/es/stateReconciler/autoMergeLevel2" {
    import { PersistConfig } from "redux-persist";
    export default function autoMergeLevel2<S>(inboundState: S, originalState: S, reducedState: S, { debug }: PersistConfig): S;
}

declare module "redux-persist/es/stateReconciler/hardSet" {
    export default function hardSet<S>(inboundState: S): S;
}

declare module "redux-persist/es/storage" {
    import { WebStorage } from "redux-persist";
    let storage: WebStorage;
    export default storage;
}

declare module "redux-persist/es/getStorage" {
    import { Storage } from "redux-persist";
    export function getStorage(type: string): Storage;
}

declare module "redux-persist/es/createWebStorage" {
    import { WebStorage } from "redux-persist";
    export function createWebStorage(type: string): WebStorage;
}

declare module "redux-persist/es/storage/session" {
    import { WebStorage } from "redux-persist";
    let sessionStorage: WebStorage;
    export default sessionStorage;
}
