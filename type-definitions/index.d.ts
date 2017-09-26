declare module "redux-persist" {
  import { Store, StoreEnhancer } from "redux";

  export interface PersistorConfig {
    blacklist?: string[];
    whitelist?: string[];
    storage?: AsyncStorage | WebStorage | LocalForageStorage;
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
  
 /**
   * React-native AsyncStorage API
   */
  export interface AsyncStorage {
    setItem(key: string, value: string, onComplete?: OnComplete<string>): Promise<void>;
    getItem(key: string, onComplete?: OnComplete<string>): Promise<string>
    removeItem(key: string, onComplete?: OnComplete<string>): Promise<void>;
    getAllKeys(onComplete?: OnComplete<string[]>): Promise<string[]>;
  }

  /**
   * localStorage, sessionStorage.
   */
  export interface WebStorage {
    setItem(key: string, value: string): void;
    getItem(key: string): string | null;
    removeItem(key: string): void;
    readonly length: number;
  }

  /**
   * LocalForage
   * https://github.com/localForage/localForage/blob/master/typings/localforage.d.ts
   */
  export interface LocalForageStorage {
    getItem<T>(key: string): Promise<T>;
    getItem<T>(key: string, callback: OnComplete<T>): void;

    setItem<T>(key: string, value: T): Promise<T>;
    setItem<T>(key: string, value: T, callback: OnComplete<T>): void;

    removeItem(key: string): Promise<void>;
    removeItem<T>(key: string, callback: OnComplete<T>): void;

    keys(): Promise<string[]>;
    keys(callback: (err: any, keys: string[]) => void): void;
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

  export function getStoredState<State>(persistorConfig?: PersistorConfig, onComplete?: OnComplete<Partial<State>>): Promise<State>;

  export function persistStore<State>(store: Store<State>, persistorConfig?: PersistorConfig, onComplete?: OnComplete<Partial<State>>): Persistor;

  export function purgeStoredState(persistorConfig?: PersistorConfig, keys?: string[]): Promise<any>;

  import * as storages from "redux-persist/storages";
  export { storages };
}

declare module "redux-persist/constants" {
  export const KEY_PREFIX = 'reduxPersist:';
  export const REHYDRATE = 'persist/REHYDRATE';
}

declare module "redux-persist/storages" {
  import { AsyncStorage } from "redux-persist";

  export const asyncLocalStorage: AsyncStorage;
  export const asyncSessionStorage: AsyncStorage;
}
