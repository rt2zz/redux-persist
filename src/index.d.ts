declare module "redux-persist" {
    import { Reducer, ReducersMapObject } from "redux";

    export type PersistState = {
        version: number,
        rehydrated: boolean
    }

    export type PersistedState = {
        _persist: PersistState,
    } | void

    export type Transform = {
        in: (state: Object, key: string) => Object,
        out: (state: Object, key: string) => Object,
        config?: PersistConfig
    }

    export type PersistConfig = {
        version?: number,
        storage: Object,
        key: string,
        /**
         * **Depricated:** keyPrefix is going to be removed in v6.
         */
        keyPrefix?: string,
        blacklist?: Array<string>,
        whitelist?: Array<string>,
        transforms?: Array<Transform>,
        throttle?: number,
        migrate?: (state: PersistedState, versionKey: number) => Promise<PersistedState>,
        stateReconciler?: false | Function,
        /**
         * Used for migrations.
         */
        getStoredState?: (config: PersistConfig) => Promise<PersistedState>,
        debug?: boolean,
        serialize?: boolean,
    }

    export type PersistorOptions = {
        enhancer?: Function,
    }

    export type PersistorSubscribeCallback = () => any;

    export type RehydrateErrorType = any

    export type RehydrateAction = {
        type: "redux-persist/REHYDRATE",
        key: string,
        payload?: Object,
        err?: RehydrateErrorType,
    }

    type PersistorState = {
        registry: Array<string>,
        bootstrapped: boolean,
    }

    type RegisterAction = {
        type: "redux-persist/REGISTER",
        key: string,
    }

    type PersistorAction = RehydrateAction | RegisterAction

    type BoostrappedCallback = () => any

    /**
     * A persistor is a redux store unto itself, allowing you to purge stored state, flush all
     * pending state serialization and immediately write to disk
     */
    export type Persistor = {
        purge: () => Promise<any>,
        flush: () => Promise<any>,
        dispatch: (action: PersistorAction) => PersistorAction,
        getState: () => PersistorState,
        subscribe: (callback: PersistorSubscribeCallback) => () => any,
    }

    /**
     * It provides a way of combining the reducers, replacing redux's @see combineReducers
     */
    export function persistCombineReducers<S>(
        config: PersistConfig,
        reducers: ReducersMapObject
    ): Reducer<S>;

    /**
     * Creates a persistor for a given store.
     * @param store store to be persisted (or match an existent storage)
     * @param persistorOptions enhancers of the persistor
     * @param cb bootstrap callback of sort.
     */
    export function persistStore(
        store: Object,
        persistorOptions?: PersistorOptions,
        cb?: BoostrappedCallback
    ): Persistor;
}

declare module "redux-persist/es/integration/react" {
    import * as React from "react";
    import { Persistor } from "redux-persist";

    /**
     * Properties of @see PersistGate
     */
    export interface PersistGateProps {
        persistor: Persistor;
        onBeforeLift?: Function;
        children?: React.ReactNode;
        loading?: React.ReactNode;
    }

    /**
     * State of @see PersistGate
     */
    export interface PersistorGateState {
        bootstrapped: boolean;
    }

    /**
     * Entry point of your react application to allow it persist a given store.
     * @see Persistor and its configuration. 
     */
    export class PersistGate extends React.PureComponent<PersistGateProps, PersistorGateState> { }
}

declare module "redux-persist/es/storage";