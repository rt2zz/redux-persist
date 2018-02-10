// @flow
import { REHYDRATE, REGISTER } from './constants'

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
  timeout?: number,
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
  in: (Object | string, string, Object | string) => Object,
  out: (Object | string, string, Object | string) => Object,
  config?: PersistConfig,
}

export type RehydrateErrorType = any

export type RehydrateAction = {
  type: typeof REHYDRATE,
  key: string,
  payload: ?Object,
  err: ?RehydrateErrorType,
}

export type Persistoid = {
  update: Object => void,
  flush: () => Promise<any>,
}

type RegisterAction = {
  type: typeof REGISTER,
  key: string,
}

type PersistorAction = RehydrateAction | RegisterAction

export type PersistorState = {
  registry: Array<string>,
  bootstrapped: boolean,
}

type PersistorSubscribeCallback = () => any

export type Persistor = {
  pause: () => void,
  persist: () => void,
  purge: () => Promise<any>,
  flush: () => Promise<any>,
  +dispatch: PersistorAction => PersistorAction,
  +getState: () => PersistorState,
  +subscribe: PersistorSubscribeCallback => () => any,
}
