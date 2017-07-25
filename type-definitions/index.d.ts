declare module "redux-persist" {
  import { Store, StoreEnhancer } from "redux";

  export interface Storage {
    setItem(key: string, value: any, onComplete?: OnComplete<any>): Promise<any>;
    getItem<Result>(
      key: string,
      onComplete?: OnComplete<Result | string>
    ): Promise<Result | string>;
    removeItem(key: string, onComplete?: OnComplete<any>): Promise<any>;
    getAllKeys?<Result>(
      callback?: (error?: Error, keys?: string[]) => void
    ): Promise<string[]>;
    getAllKeys?<Result>(onComplete?: OnComplete<Result>): Promise<Result>;
    keys?: (...args: any[]) => any;
    [key: string]: any; // In case Storage object has some other (private?) methods and properties.
  }

  export interface PersistorConfig {
    blacklist?: string[];
    whitelist?: string[];
    storage?: Storage;
    transforms?: Array<Transform<any, any>>;
    debounce?: number;
    serialize?: boolean;
    keyPrefix?: string;
  }

  export type TransformIn<State, Raw> = (state: State, key: string) => Raw;

  export type TransformOut<Raw, State> = (raw: Raw, key: string) => State;

  export interface Transform<State, Raw> {
    in: TransformIn<State, Raw>;
    out: TransformOut<Raw, State>;
  }

  export type OnComplete<Result> = (err?: any, result?: Result) => any;

  export interface RehydrateOptions {
    serial?: boolean;
  }

  export interface Persistor {
    purge(keys?: string[]): void;
    rehydrate<State>(incoming: State, options: RehydrateOptions): undefined;
    pause(): void;
    resume(): void;
  }

  export type StateReconciler<PrevState, InboundState, NextState> = (state: PrevState, inboundState: InboundState, reducedState: any, log: boolean) => NextState;

  export interface AutoRehydrateConfig {
    log?: boolean;
    stateReconciler?: StateReconciler<any, any, any>;
  }

  export function autoRehydrate<State>(autoRehydrateConfig?: AutoRehydrateConfig): StoreEnhancer<State>;

  export function createPersistor<State>(store: Store<State>, persistorConfig: PersistorConfig): Persistor;

  export interface TransformConfig {
    whitelist?: string[];
    blacklist?: string[];
  }

  export function createTransform<State, Raw>(transformIn: TransformIn<State, Raw>, transformOut: TransformOut<Raw, State>, config?: TransformConfig): Transform<State, Raw>;

  export function getStoredState<State>(persistorConfig?: PersistorConfig, onComplete?: OnComplete<any>): Promise<State>;

  export function persistStore<State>(store: Store<State>, persistorConfig?: PersistorConfig, onComplete?: OnComplete<any>): Persistor;

  export function purgeStoredState(persistorConfig?: PersistorConfig, keys?: string[]): Promise<any>;

  import * as storages from "redux-persist/storages";
  export { storages };
}

declare module "redux-persist/constants" {
  export const KEY_PREFIX = 'reduxPersist:';
  export const REHYDRATE = 'persist/REHYDRATE';
}

declare module "redux-persist/storages" {
  import { Storage } from "redux-persist";

  export const asyncLocalStorage: Storage;
  export const asyncSessionStorage: Storage;
}
