// @flow

import type {
  Persistor,
  PersistConfig,
  PersistorOptions,
  PersistorState,
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

const initialState: PersistorState = {
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
  let { timeout } = options

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
  let _timedOut = true

  let _pStore = createStore(persistorReducer, initialState, options.enhancer)
  let register = (key: string) => {
    _pStore.dispatch({
      type: REGISTER,
      key,
    })
  }

  let rehydrate = (key: string, payload?: Object, err: any) => {
    // noop if timed out
    if (_timedOut) {
      if (process.env.NODE_ENV !== 'production')
        console.error(
          `redux-persist: rehydrate for "${key}" called after timeout.`,
          payload,
          err
        )
      return
    }
    let rehydrateAction = {
      type: REHYDRATE,
      payload,
      err,
      key,
    }
    // dispatch to `store` to rehydrate and `persistor` to track result
    store.dispatch(rehydrateAction)
    _pStore.dispatch(rehydrateAction)
    if (boostrappedCb && persistor.getState().bootstrapped) {
      boostrappedCb()
      boostrappedCb = false
    }
  }

  let persistor: Persistor = {
    ..._pStore,
    purge: () => {
      let results = []
      store.dispatch({
        type: PURGE,
        result: purgeResult => {
          results.push(purgeResult)
        },
      })
      return Promise.all(results)
    },
    flush: () => {
      let results = []
      store.dispatch({
        type: FLUSH,
        result: flushResult => {
          results.push(flushResult)
        },
      })
      return Promise.all(results)
    },
    pause: () => {
      store.dispatch({
        type: PAUSE,
      })
    },
    persist: () => {
      // if timeout is exceeded, flush all pending keys with an error rehydrate
      _timedOut = false
      if (timeout)
        setTimeout(() => {
          let { registry } = persistor.getState()
          let TimeoutError = new Error(
            `redux-persist: persist timeout with [${registry.join(
              ', '
            )}] keys outstanding.`
          )
          registry.forEach(k => rehydrate(k, undefined, TimeoutError))
          _timedOut = true
        }, timeout)
      store.dispatch({ type: PERSIST, register, rehydrate })
    },
  }

  persistor.persist()

  return persistor
}
