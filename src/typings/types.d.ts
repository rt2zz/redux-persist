declare module 'redux-persist/types' {
  export type PersistState = {
    version: number;
    rehydrated: boolean;
  }

  export type PersistedState = { _persist: PersistState } | void;

  export type PersistConfig = {
    blacklist?: Array<string>,
    debug?: boolean,
    getStoredState?: (config: PersistConfig) => Promise<PersistedState>, // used for migrations
    key: string,
    keyPrefix?: string, // @TODO remove in v6
    migrate?: (state: PersistedState, version: number) => Promise<PersistedState>,
    serialize?: boolean,
    stateReconciler?: false | Function,
    storage: Object,
    throttle?: number,
    transforms?: Array<Transform>,
    version?: number,
    whitelist?: Array<string>,
  }

  export type PersistorOptions = {
    enhancer?: Function,
  }

  export type Storage = {
    getItem: (key: string, resolve?: (key: string) => any) => any,
    setItem: (key: string, item: string, resolve?: () => any) => any,
    removeItem: (key: string, resolve?: () => any) => any,
  }

  export type MigrationManifest = {
    [key: string]: (state: PersistedState) => PersistedState,
  }

  export type Transform = {
    in: (partialState: Object | string, key: string) => Object,
    out: (partialState: Object | string, key: string) => Object,
    config?: PersistConfig,
  }

  export type RehydrateErrorType = any

  export type RehydrateAction = {
    type: 'redux-persist/REHYDRATE',
    key: string,
    payload?: Object,
    err?: RehydrateErrorType,
  }

  export type Persistoid = {
    update: (state: Object) => void,
    flush: () => Promise<any>,
  }

  type RegisterAction = {
    type: 'redux-persist/REGISTER',
    key: string,
  }

  type PersistorAction = RehydrateAction | RegisterAction

  type PersistorState = {
    registry: Array<string>,
    bootstrapped: boolean,
  }

  type PersistorSubscribeCallback = () => any

  export type Persistor = {
    purge: () => Promise<any>,
    flush: () => Promise<any>,
    dispatch: (action: PersistorAction) => PersistorAction,
    getState: () => PersistorState,
    subscribe: (callback: PersistorSubscribeCallback) => () => any,
  }
}
