import { Action } from "redux";

export interface Storage {
    setItem(key: string, value: any, onComplete?: OnComplete<void>): Promise<void>;
    getItem<Result>(key: string, onComplete?: OnComplete<Result>): Promise<Result>;
    removeItem(key: string, onComplete?: OnComplete<void>): Promise<void>;
    getAllKeys<Result>(onComplete?: OnComplete<Result>): Promise<Result>;
    [key: string]: any;
}

export type TransformIn<State, Raw> = (state: State, key: string) => Raw;

export type TransformOut<Raw, State> = (raw: Raw, key: string) => State;

export interface Transform<State, Raw> {
    in: TransformIn<State, Raw>;
    out: TransformOut<Raw, State>;
}

export interface TransformConfig {
    whitelist?: string[];
    blacklist?: string[];
}

export interface PersistorConfig extends TransformConfig {
    transforms?: Array<Transform<any, any>>;
    storage?: Storage;
    debounce?: number;
    keyPrefix?: string;
}

export interface RehydrateOptions {
    serial?: boolean;
}

export  interface Persistor {
    purge(keys: string[]): void;
    rehydrate<State>(incoming: State, options?: RehydrateOptions): State;
    pause(): void;
    resume(): void;
}

export type StateReconciler<PrevState, InboundState, NextState> = (state: PrevState, inboundState: InboundState, reducedState: NextState, log?: boolean) => NextState;

export interface AutoRehydrateConfig {
    log?: boolean;
    stateReconciler?: StateReconciler<any, any, any>;
}

export type OnComplete<Result> = (err?: any, result?: Result) => void;

export interface PersistAction<NextState> extends Action {
    payload?: NextState
    error?: any
}

export { default as autoRehydrate } from "redux-persist/lib/autoRehydrate";
export { default as createPersistor } from "redux-persist/lib/createPersistor";
export { default as createTransform } from "redux-persist/lib/createTransform";
export { default as getStoredState } from "redux-persist/lib/getStoredState";
export { default as persistStore } from "redux-persist/lib/persistStore";
export { default as purgeStoredState } from "redux-persist/lib/purgeStoredState";

/* This is deprecated since 4.0.0 */
export const storages: {
    asyncLocalStorage: Storage
    asyncSessionStorage: Storage
}
