declare module "redux-persist" {
  import { Store, StoreEnhancer } from "redux";

  export interface Storage {
    setItem: Function;
    getItem: Function;
    removeItem: Function;
    getAllKeys?: Function;
    keys?: Function;
  }

  export interface PersistorConfig {
    blacklist?: string[];
    whitelist?: string[];
    storage?: Storage;
    transforms?: Array<Transform<any, any>>;
    debounce?: number;
    serialize?: boolean;
  }

  export interface TransformIn<State, Raw> {
    (state: State, key: string): Raw;
  }

  export interface TransformOut<Raw, State> {
    (raw: Raw, key: string): State;
  }

  export interface Transform<State, Raw> {
    in: TransformIn<State, Raw>;
    out: TransformOut<Raw, State>;
  }

  export interface OnComplete {
    (err?: any, result?: Object): void;
  }

  export interface Persistor {
    purge: (keys?: string[]) => void;
    rehydrate: (incoming: Object, options: { serial: boolean }) => void;
    pause: () => void;
    resume: () => void;
  }

  export interface StateReconciler<PrevState, NextState> {
    (state: PrevState, inboundState: Object, reducedState: Object, log: boolean): NextState;
  }

  export interface AutoRehydrateConfig {
    log?: boolean;
    stateReconciler?: StateReconciler<any, any>;
  }

  export function autoRehydrate<State>(autoRehydrateConfig?: AutoRehydrateConfig): StoreEnhancer<State>;

  export function createPersistor<State>(store: Store<State>, persistorConfig: PersistorConfig): Persistor;

  export interface TransformConfig {
    whitelist?: string[];
    blacklist?: string[];
  }

  export function createTransform<State, Raw>(transformIn: TransformIn<State, Raw>, transformOut: TransformOut<Raw, State>, config?: TransformConfig): Transform<State, Raw>;

  export function getStoredState(persistorConfig?: PersistorConfig, onComplete?: OnComplete): void;

  export function persistStore<State>(store: Store<State>, persistorConfig?: PersistorConfig, onComplete?: OnComplete): Persistor;

  export function purgeStoredState(persistorConfig?: PersistorConfig, keys?: string[]): Promise<void>;

  export const storages: {
    asyncLocalStorage: Storage,
    asyncSessionStorage: Storage,
  };
}

declare module "redux-persist/constants" {
  export const KEY_PREFIX: string;
  export const REHYDRATE: string;
}

declare module "redux-persist/storages" {
  export const asyncLocalStorage: Storage;
  export const asyncSessionStorage: Storage;
}
