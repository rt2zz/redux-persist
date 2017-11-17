// @flow

export type PersistState = {
  version: number,
  rehydrated: boolean,
}

export type PersistedState = {
  _persist: PersistState,
} | void

export type PersistConfig = {
  version?: number,
  storage: Object,
  key: string,
  keyPrefix?: string, // @TODO remove in v6
  blacklist?: Array<string>,
  whitelist?: Array<string>,
  transforms?: Array<Transform>,
  throttle?: number,
  migrate?: (PersistedState, number) => Promise<PersistedState>,
  stateReconciler?: false | Function,
  getStoredState?: PersistConfig => Promise<PersistedState>, // used for migrations
  debug?: boolean,
  serialize?: boolean,
}

export type PersistorOptions = {
  enhancer?: Function,
}

export type Storage = {
  getItem: (string, ?(string) => any) => any,
  setItem: (string, string, ?() => any) => any,
  removeItem: (string, ?() => any) => any,
}

export type MigrationManifest = {
  [number | string]: (PersistedState) => PersistedState,
}

export type Transform = {
  in: (Object | string, string) => Object,
  out: (Object | string, string) => Object,
  config?: PersistConfig,
}

export type RehydrateErrorType = any

export type RehydrateAction = {
  type: 'redux-persist/REHYDRATE',
  key: string,
  payload: ?Object,
  err: ?RehydrateErrorType,
}

export type Persistoid = {
  update: Object => void,
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
  +dispatch: PersistorAction => PersistorAction,
  +getState: () => PersistorState,
  +subscribe: PersistorSubscribeCallback => () => any,
}
