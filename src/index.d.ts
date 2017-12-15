
declare module "redux-persist" {
    export * from "redux-persist/es/constants";
    export * from "redux-persist/es/types";
    export * from "redux-persist/es/createMigrate";
    export * from "redux-persist/es/createPersistoid";
    export * from "redux-persist/es/createWebStorage";
    export * from "redux-persist/es/getStoredState";
    export * from "redux-persist/es/persistCombineReducers";
    export * from "redux-persist/es/persistReducer";
    export * from "redux-persist/es/persistStore";
    export * from "redux-persist/es/purgeStoredState";
}

declare module "redux-persist/es/constants" {
    /* constants */
    export const DEFAULT_VERSION: number;
    export const FLUSH: string;
    export const KEY_PREFIX: string;
    export const PAUSE: string;
    export const PERSIST: string;
    export const PURGE: string;
    export const REGISTER: string;
    export const REHYDRATE: string;
}

declare module "redux-persist/es/types" {
    /* types */
    export interface PersistState { version: number; rehydrated: boolean; }
    export type PersistedState = { _persist: PersistState } | void;
    export interface Transform<S, R> {
        in(state: S, key: string): R;
        out(state: R, key: string): S;
        config?: PersistConfig
    }
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
    }
    export interface PersistorOptions { enhancer?: Function }
    export interface MigrationManifest {
        [key: string]: (state: PersistedState) => PersistedState;
    }
    export type RehydrateErrorType = any;
    export type RehydrateAction = {
        type: 'redux-persist/es/REHYDRATE',
        key: string,
        payload?: object,
        err?: RehydrateErrorType,
    }
    export interface Persistoid {
        update(item: object): void;
        flush(): Promise<any>;
    }
    export type RegisterAction = {
        type: 'redux-persist/es/REGISTER',
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
        purge(): Promise<any>;
        flush(): Promise<any>;
        dispatch(action: PersistorAction): PersistorAction;
        getState(): PersistorState;
        subscribe(callback: PersistorSubscribeCallback): () => any;
    }
    /* storage types */
    export interface WebStorage {
        getItem(key: string): Promise<string>;
        setItem(key: string, item: string): Promise<string>;
        removeItem(key: string): Promise<void>;
    }
    export interface AsyncStorage {
        getItem(key: string, callback?: (error?: Error, result?: string) => void): Promise<string>;
        setItem(key: string, value: string, callback?: (error?: Error) => void): Promise<void>;
        removeItem(key: string, callback?: (error?: Error) => void): Promise<void>;
        mergeItem(key: string, value: string, callback?: (error?: Error) => void): Promise<void>;
        clear(callback?: (error?: Error) => void): Promise<void>;
        getAllKeys(callback?: (error?: Error, keys?: string[]) => void): Promise<string[]>;
        multiGet(keys: string[], callback?: (errors?: Error[], result?: [string, string][]) => void): Promise<[string, string][]>;
        multiSet(keyValuePairs: string[][], callback?: (errors?: Error[]) => void): Promise<void>;
        multiRemove(keys: string[], callback?: (errors?: Error[]) => void): Promise<void>;
        multiMerge(keyValuePairs: string[][], callback?: (errors?: Error[]) => void): Promise<void>;
    }
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
        getItem(key: string, callback?: (k: string) => any): any;
        setItem(key: string, callback?: () => any): any;
        remoteItem(key: string, callback?: () => any): any;
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

declare module "redux-persist/es/createWebStorage" {
    import { WebStorage } from "redux-persist/es/types";
    export function createWebStorage(type: string): WebStorage;
}

declare module "redux-persist/es/getStoredState" {
    import { PersistConfig } from "redux-persist/es/types";
    export function getStoredState(config: PersistConfig): Promise<Object | void>;
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
    // persistReducer
    export interface PersistPartial { _persist: PersistState }
    export type BaseReducer<S, A> = (state: S | void, action: A) => S;
    /**
     * It provides a way of combining the reducers, replacing redux's @see combineReducers
     * @param config persistence configuration
     * @param baseReducer reducer used to persist the state
     */
    export function persistReducer<S, A>(config: PersistConfig, baseReducer: BaseReducer<S, A>): (s: S, a: A) => S & PersistPartial;
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

declare module "redux-persist/es/integration/react" {
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

declare module "redux-persist/es/integration/getStoredStateMigrateV4" {
    import { PersistConfig, Transform } from "redux-persist";

    export interface V4Config {
        storage?: object;
        keyPrefix?: string;
        transforms?: Array<Transform<any, any>>;
        blacklist?: Array<string>;
        whitelist?: Array<string>;
    }

    export function getStoredState(v4Config: V4Config): (config: PersistConfig) => Promise<object | void>;
}

declare module "redux-persist/es/stateReconciler/autoMergeLevel1" {
    import { PersistConfig } from "redux-persist";
    export function autoMergeLevel1<S>(inboundState: S, originalState: S, reducedState: S, { debug }: PersistConfig): S;
}

declare module "redux-persist/es/stateReconciler/autoMergeLevel2" {
    import { PersistConfig } from "redux-persist";
    export function autoMergeLevel2<S>(inboundState: S, originalState: S, reducedState: S, { debug }: PersistConfig): S;
}

declare module "redux-persist/es/stateReconciler/hardSet" {
    export function hardSet<S>(inboundState: S): S;
}

declare module "redux-persist/es/storage" {
    import { WebStorage } from "redux-persist";
    export let storage: WebStorage;
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
