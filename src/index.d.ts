import { Reducer, Store } from "redux";

declare module "redux-persist" {
    import {
        StoreEnhancer,
        Reducer,
        ReducersMapObject,
        Store
    } from "redux";

    export const KEY_PREFIX: "persist:";
    export const FLUSH: "persist/FLUSH";
    export const REHYDRATE: "persist/REHYDRATE";
    export const PAUSE: "persist/PAUSE";
    export const PERSIST: "persist/PERSIST";
    export const PURGE: "persist/PURGE";
    export const REGISTER: "persist/REGISTER";
    export const DEFAULT_VERSION: number;

    export type RehydrateAction<Payload> = {
        type: typeof REHYDRATE;
        key: string;
        payload?: Payload;
        err?: any;
    }

    type RegisterAction = {
        type: typeof REGISTER;
        key: string;
    }

    export interface PersistState {
        version: number;
        rehydrated: boolean;
    }

    export interface PersistedState {
        _persist: PersistState;
    }

    export interface AsyncStorage {
        setItem(key: string, value: any, ...args: any[]): Promise<any>;
        getItem(key: string, ...args: any[]): Promise<any>;
        removeItem(key: string, ...args: any[]): Promise<any>;
    }

    export type TransformIn<State, Raw> = (state: State, key: string) => Raw;
    export type TransformOut<Raw, State> = (raw: Raw, key: string) => State;

    export type Transform<State, Raw> = {
        in: TransformIn<State, Raw>;
        out: TransformOut<Raw, State>;
        config?: PersistConfig;
    }

    export interface Persistor {
        purge(): Promise<void>;
        flush(): Promise<void>;
    }

    export type StateReconciler = (
        inboundState: any,
        originalState: any,
        reducedState: any,
        config: PersistConfig
    ) => any;

    export interface Persistoid {
        update(state: any): void;
    }

    export interface PersistorConfig<State> {
        enhancer: StoreEnhancer<State>;
    }

    export type PersistConfig = {
        key: string;
        storage: AsyncStorage;
        version?: number;
        blacklist?: string[];
        whitelist?: string[];
        migrate?: Migrate;
        transforms?: Array<Transform<any, any>>;
        throttle?: number;
        /**
         * @deprecated keyPrefix is going to be removed in v6.
         */
        keyPrefix?: string;
        stateReconciler?: false | StateReconciler;
        serialize?: boolean;
    }

    export type Migrate = (state: PersistedState, versionNumber?: number) => Promise<PersistedState>;

    export interface MigrationManifest {
        [index: string]: (state: any) => any;
    }

    export interface MigrateConfig {
        debug?: boolean;
    }

    export function createMigrate(migrations: MigrationManifest, config?: MigrateConfig): Migrate;

    export function createPersistoid(config: PersistConfig): Persistoid;

    export function createTransform<In, Out>(
        inbound: TransformIn<In, Out>,
        outbound: TransformOut<Out, In>,
        config?: Pick<PersistConfig, "whitelist" | "blacklist">
    ): Transform<In, Out>;

    export function getStoredState<State>(config: PersistConfig): Promise<State>;

    export function persistCombinedReducers<State>(config: PersistConfig, reducers: ReducersMapObject): Reducer<State>;

    export function persistReducer<State>(config: PersistConfig, reducer: Reducer<State>): Reducer<State>;

    export function persistStore<State>(
        store: Store<State>,
        config?: Partial<PersistorConfig<State>>,
        callback?: any
    ): Persistor;

    export function purgeStoredState(config: PersistConfig): Promise<any>;
}

// Exports from lib

declare module "redux-persist/lib/constants" {
    export {
        KEY_PREFIX,
        FLUSH,
        REHYDRATE,
        PAUSE,
        PERSIST,
        PURGE,
        REGISTER,
        DEFAULT_VERSION
    } from "redux-persist";
}

declare module "redux-persist/lib/createMigrate" {
    import { createMigrate } from "redux-persist";
    export default createMigrate;
}

declare module "redux-persist/lib/createPersistoid" {
    import { createPersistoid } from "redux-persist";
    export default createPersistoid;
}

declare module "redux-persist/lib/createTransform" {
    import { createTransform } from "redux-persist";
    export default createTransform;
}

declare module "redux-persist/lib/getStoredState" {
    import { getStoredState } from "redux-persist";
    export default getStoredState;
}

declare module "redux-persist/lib/persistCombinedReducers" {
    import { persistCombinedReducers } from "redux-persist";
    export default getStoredState;
}

declare module "redux-persist/lib/persistReducer" {
    import { persistReducer } from "redux-persist";
    export default persistReducer;
}

declare module "redux-persist/lib/persistStore" {
    import { persistStore } from "redux-persist";
    export default persistStore;
}

declare module "redux-persist/lib/purgeStoredState" {
    import { purgeStoredState } from "redux-persist";
    export default purgeStoredState;
}

declare module "redux-persist/lib/storage" {
    import { AsyncStorage } from "redux-persist";
    const localStorage: AsyncStorage;
    export default localStorage;
}

declare module "redux-persist/lib/storage/session" {
    import { AsyncStorage } from "redux-persist";
    const sessionStorage: AsyncStorage;
    export default sessionStorage;
}

declare module "redux-persist/lib/integration/react" {
    import { Component, ReactNode } from "react";
    import { Persistor } from "redux-persist";

    export interface PersistGateProps {
        persistor: Persistor;
        onBeforeLift?(): any;
        children?: ReactNode;
        loading?: ReactNode;
    }

    export interface PersistorGateState {
        bootstrapped: boolean;
    }

    export class PersistGate extends Component<PersistGateProps, PersistorGateState> {}
}

// Exports from es

declare module "redux-persist/es/constants" {
    export {
        KEY_PREFIX,
        FLUSH,
        REHYDRATE,
        PAUSE,
        PERSIST,
        PURGE,
        REGISTER,
        DEFAULT_VERSION
    } from "redux-persist";
}

declare module "redux-persist/es/createMigrate" {
    import { createMigrate } from "redux-persist";
    export default createMigrate;
}

declare module "redux-persist/es/createPersistoid" {
    import { createPersistoid } from "redux-persist";
    export default createPersistoid;
}

declare module "redux-persist/es/createTransform" {
    import { createTransform } from "redux-persist";
    export default createTransform;
}

declare module "redux-persist/es/getStoredState" {
    import { getStoredState } from "redux-persist";
    export default getStoredState;
}

declare module "redux-persist/es/persistCombinedReducers" {
    import { persistCombinedReducers } from "redux-persist";
    export default getStoredState;
}

declare module "redux-persist/es/persistReducer" {
    import { persistReducer } from "redux-persist";
    export default persistReducer;
}

declare module "redux-persist/es/persistStore" {
    import { persistStore } from "redux-persist";
    export default persistStore;
}

declare module "redux-persist/es/purgeStoredState" {
    import { purgeStoredState } from "redux-persist";
    export default purgeStoredState;
}

declare module "redux-persist/es/storage" {
    import localStorage from "redux-persist/redux-persist/lib/storage";
    export default localStorage;
}

declare module "redux-persist/es/storage/session" {
    import sessionStorage from "redux-persist/redux-persist/lib/storage/session";
    export default sessionStorage;
}

declare module "redux-persist/es/integration/react" {
    export { PersistGate } from "redux-persist/lib/integration/react";
}
