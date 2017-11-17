// @flow

import type {
  Persistor,
  PersistConfig,
  PersistorOptions,
  MigrationManifest,
  RehydrateAction,
  RehydrateErrorType,
} from './types'

import { createStore } from 'redux'
import persistReducer from './persistReducer'
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from './constants'

type PendingRehydrate = [Object, RehydrateErrorType, PersistConfig]
type Persist = <R>(PersistConfig, MigrationManifest) => R => R
type CreatePersistor = Object => void
type BoostrappedCb = () => any

const initialState = {
  registry: [],
  bootstrapped: false,
}

const persistorReducer = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER:
      return { ...state, registry: [...state.registry, action.key] }
    case REHYDRATE:
      let firstIndex = state.registry.indexOf(action.key)
      let registry = [...state.registry]
      registry.splice(firstIndex, 1)
      return { ...state, registry, bootstrapped: registry.length === 0 }
    default:
      return state
  }
}

export default function persistStore(
  store: Object,
  persistorOptions?: PersistorOptions,
  cb?: BoostrappedCb
): Persistor {
  let options: Object = persistorOptions || {}

  // help catch incorrect usage of passing PersistConfig in as PersistorOptions
  if (process.env.NODE_ENV !== 'production') {
    let bannedKeys = [
      'blacklist',
      'whitelist',
      'transforms',
      'storage',
      'keyPrefix',
      'migrate',
    ]
    bannedKeys.forEach(k => {
      if (!!options[k])
        console.error(
          `redux-persist: invalid option passed to persistStore: "${k}". You may be incorrectly passing persistConfig into persistStore, whereas it should be passed into persistReducer.`
        )
    })
  }
  let boostrappedCb = cb || false
  let persistor = createStore(persistorReducer, undefined, options.enhancer)

  persistor.purge = () => {
    let results = []
    store.dispatch({
      type: PURGE,
      result: purgeResult => {
        results.push(purgeResult)
      },
    })
    return Promise.all(results)
  }

  persistor.flush = () => {
    let results = []
    store.dispatch({
      type: FLUSH,
      result: flushResult => {
        results.push(flushResult)
      },
    })
    return Promise.all(results)
  }

  persistor.pause = () => {
    store.dispatch({
      type: PAUSE,
    })
  }

  let register = (key: string) => {
    persistor.dispatch({
      type: REGISTER,
      key,
    })
  }

  let rehydrate = (key: string, payload: Object, err: any) => {
    let rehydrateAction = {
      type: REHYDRATE,
      payload,
      err,
      key,
    }
    // dispatch to `store` to rehydrate and `persistor` to track result
    store.dispatch(rehydrateAction)
    persistor.dispatch(rehydrateAction)
    if (boostrappedCb && persistor.getState().bootstrapped) {
      boostrappedCb()
      boostrappedCb = false
    }
  }

  persistor.persist = () => {
    store.dispatch({ type: PERSIST, register, rehydrate })
  }

  persistor.persist()

  return persistor
}
