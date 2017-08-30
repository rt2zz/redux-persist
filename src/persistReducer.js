// @flow
import { PERSIST, PURGE, REHYDRATE, DEFAULT_VERSION } from './constants'

import type {
  PersistConfig,
  MigrationManifest,
  PersistState,
  Persistoid,
} from './types'

import stateReconciler from './stateReconciler'
import createPersistoid from './createPersistoid'
import getStoredState from './getStoredState'
import purgeStoredState from './purgeStoredState'

type PersistPartial = { _persist: PersistState }
/*
  @TODO add validation / handling for:
  - persisting a reducer which has nested _persist
  - handling actions that fire before reydrate is called
*/
export default function persistReducer<State: Object, Action: Object>(
  config: PersistConfig,
  baseReducer: (State, Action) => State
): (State, Action) => State & PersistPartial {
  if (process.env.NODE_ENV !== 'production') {
    if (!config) throw new Error('config is required for persistReducer')
    if (!config.key) throw new Error('key is required in persistor config')
    if (!config.storage)
      throw new Error(
        "redux-persist: config.storage is required. Try using `import storageLocal from 'redux-persist/es/storages/local'"
      )
  }

  const version =
    config.version !== undefined ? config.version : DEFAULT_VERSION
  const debug = config.debug || false
  let _persistoid = null
  let _purge = false

  if (process.env.NODE_ENV !== 'production') {
    // $FlowIgnore
    let defaultState = baseReducer(undefined, {
      type: 'redux-persist/default-state-probe',
    })
    if (Array.isArray(defaultState) || typeof defaultState !== 'object')
      console.error(
        'redux-persist: does not yet support non plain object state.'
      )
  }
  return (state: State, action: Action) => {
    let { _persist, ...rest } = state || {}
    let restState: State = rest

    if (action.type === PERSIST) {
      // @NOTE PERSIST can be called multiple times, noop after the first
      if (_persist) return state
      if (
        typeof action.rehydrate !== 'function' ||
        typeof action.register !== 'function'
      )
        throw new Error(
          'redux-persist: either rehydrate or register is not a function on the PERSIST action. This can happen if the action is being replayed. This is an unexplored use case, please open an issue and we will figure out a resolution.'
        )

      action.register(config.key)
      _persistoid = createPersistoid(config)

      getStoredState(config).then(
        restoredState => {
          const migrate = config.migrate || ((s, v) => Promise.resolve(s))
          migrate(restoredState, version).then(
            migratedState => {
              action.rehydrate(config.key, migratedState)
            },
            migrateErr => {
              if (process.env.NODE_ENV !== 'production' && migrateErr)
                console.error('redux-persist: migration error', migrateErr)
              action.rehydrate(config.key, undefined, migrateErr)
            }
          )
        },
        err => {
          action.rehydrate(config.key, undefined, err)
        }
      )

      return { ...state, _persist: { version, rehydrated: false } }
    } else if (action.type === PURGE) {
      _purge = true
      purgeStoredState(config)
      return state
    } else if (action.type === REHYDRATE) {
      // noop if purging
      if (_purge) return state

      // @NOTE if key does not match, will continue to default else below
      if (action.key === config.key) {
        let reducedState = baseReducer(restState, action)
        let inboundState = action.payload
        let reconciledRest: State = stateReconciler(
          state,
          inboundState,
          reducedState,
          config
        )

        return {
          ...reconciledRest,
          _persist: { ..._persist, rehydrated: true },
        }
      }
    }

    // if we have not already handled PERSIST, straight passthrough
    if (!_persist) return baseReducer(state, action)

    // otherwise, pull off _persist, run the reducer, and update the persistoid
    // @TODO more performant workaround for combineReducers warning
    let newState = {
      ...baseReducer(restState, action),
      _persist,
    }
    _persistoid && _persistoid.update(newState)
    return newState
  }
}
