declare module "redux-persist/lib/interfaces" {
  export {
    Store,
    StoreEnhancer,
  } from "redux";

  export interface Storage {
    setItem: Function;
    getItem: Function;
    removeItem: Function;
    getAllKeys: Function;
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

  export  interface Persistor {
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
}

declare module "redux-persist/lib/autoRehydrate" {
  import {
    StoreEnhancer,
    AutoRehydrateConfig,
  } from "redux-persist/lib/interfaces";

  function autoRehydrate<State>(autoRehydrateConfig?: AutoRehydrateConfig): StoreEnhancer<State>;

  export default autoRehydrate;
}

declare module "redux-persist/lib/createPersistor" {
  import {
    Store,
    PersistorConfig,
    Persistor,
  } from "redux-persist/lib/interfaces";

  function createPersistor<State>(store: Store<State>, persistorConfig: PersistorConfig): Persistor;

  export default createPersistor;
}

declare module "redux-persist/lib/createTransform" {
  import {
    TransformIn,
    TransformOut,
    Transform,
  } from "redux-persist/lib/interfaces";

  export interface TransformConfig {
    whitelist?: string[];
    blacklist?: string[];
  }

  function createTransform<State, Raw>(transformIn: TransformIn<State, Raw>, transformOut: TransformOut<Raw, State>, config?: TransformConfig): Transform<State, Raw>;

  export default createTransform;
}

declare module "redux-persist/lib/getStoredState" {
  import {
    OnComplete,
    PersistorConfig,
  } from "redux-persist/lib/interfaces";

  function getStoredState(persistorConfig?: PersistorConfig, onComplete?: OnComplete): void;

  export default getStoredState;
}

declare module "redux-persist/lib/persistStore" {
  import {
    OnComplete,
    Store,
    PersistorConfig,
    Persistor,
  } from "redux-persist/lib/interfaces";

  function persistStore<State>(store: Store<State>, persistorConfig?: PersistorConfig, onComplete?: OnComplete): Persistor;

  export default persistStore;
}

declare module "redux-persist/lib/purgeStoredState" {
  import {
    PersistorConfig,
  } from "redux-persist/lib/interfaces";

  function purgeStoredState(persistorConfig?: PersistorConfig, keys?: string[]): Promise<void>;

  export default purgeStoredState;
}

declare module "redux-persist" {
  export { Storage } from "redux-persist/lib/interfaces";

  export { default as autoRehydrate } from "redux-persist/lib/autoRehydrate";
  export { default as createPersistor } from "redux-persist/lib/createPersistor";
  export { default as createTransform } from "redux-persist/lib/createTransform";
  export { default as getStoredState } from "redux-persist/lib/getStoredState";
  export { default as persistStore } from "redux-persist/lib/persistStore";
  export { default as purgeStoredState } from "redux-persist/lib/purgeStoredState";

  export const storages: {
    asyncLocalStorage: Storage,
    asyncSessionStorage: Storage,
  };
}
