// @flow
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REHYDRATE,
  DEFAULT_VERSION,
} from './constants'

import type {
  PersistConfig,
  MigrationManifest,
  PersistState,
  Persistoid,
} from './types'

import autoMergeLevel1 from './stateReconciler/autoMergeLevel1'
import createPersistoid from './createPersistoid'
import defaultGetStoredState from './getStoredState'
import purgeStoredState from './purgeStoredState'

type PersistPartial = { _persist: PersistState }
const DEFAULT_TIMEOUT = 5000
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
        "redux-persist: config.storage is required. Try using one of the provided storage engines `import storage from 'redux-persist/lib/storage'`"
      )
  }

  const version =
    config.version !== undefined ? config.version : DEFAULT_VERSION
  const debug = config.debug || false
  const stateReconciler =
    config.stateReconciler === undefined
      ? autoMergeLevel1
      : config.stateReconciler
  const getStoredState = config.getStoredState || defaultGetStoredState
  const timeout =
    config.timeout !== undefined ? config.timeout : DEFAULT_TIMEOUT
  let _persistoid = null
  let _purge = false
  let _paused = true
  const conditionalUpdate = state => {
    // update the persistoid only if we are rehydrated and not paused
    state._persist.rehydrated &&
      _persistoid &&
      !_paused &&
      _persistoid.update(state)
    return state
  }

  return (state: State, action: Action) => {
    let { _persist, ...rest } = state || {}
    let restState: State = rest

    if (action.type === PERSIST) {
      let _sealed = false
      let _rehydrate = (payload, err) => {
        // dev warning if we are already sealed
        if (process.env.NODE_ENV !== 'production' && _sealed)
          console.error(
            `redux-persist: rehydrate for "${
              config.key
            }" called after timeout.`,
            payload,
            err
          )

        // only rehydrate if we are not already sealed
        if (!_sealed) {
          action.rehydrate(config.key, payload, err)
          _sealed = true
        }
      }
      timeout &&
        setTimeout(() => {
          !_sealed &&
            _rehydrate(
              undefined,
              new Error(
                `redux-persist: persist timed out for persist key "${
                  config.key
                }"`
              )
            )
        }, timeout)

      // @NOTE PERSIST resumes if paused.
      _paused = false

      // @NOTE only ever create persistoid once, ensure we call it at least once, even if _persist has already been set
      if (!_persistoid) _persistoid = createPersistoid(config)

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

      getStoredState(config).then(
        restoredState => {
          const migrate = config.migrate || ((s, v) => Promise.resolve(s))
          migrate(restoredState, version).then(
            migratedState => {
              _rehydrate(migratedState)
            },
            migrateErr => {
              if (process.env.NODE_ENV !== 'production' && migrateErr)
                console.error('redux-persist: migration error', migrateErr)
              _rehydrate(undefined, migrateErr)
            }
          )
        },
        err => {
          _rehydrate(undefined, err)
        }
      )

      return {
        ...baseReducer(restState, action),
        _persist: { version, rehydrated: false },
      }
    } else if (action.type === PURGE) {
      _purge = true
      action.result(purgeStoredState(config))
      return {
        ...baseReducer(restState, action),
        _persist,
      }
    } else if (action.type === FLUSH) {
      action.result(_persistoid && _persistoid.flush())
      return {
        ...baseReducer(restState, action),
        _persist,
      }
    } else if (action.type === PAUSE) {
      _paused = true
    } else if (action.type === REHYDRATE) {
      // noop on restState if purging
      if (_purge)
        return {
          ...restState,
          _persist: { ..._persist, rehydrated: true },
        }

      // @NOTE if key does not match, will continue to default else below
      if (action.key === config.key) {
        let reducedState = baseReducer(restState, action)
        let inboundState = action.payload
        // only reconcile state if stateReconciler and inboundState are both defined
        let reconciledRest: State =
          stateReconciler !== false && inboundState !== undefined
            ? stateReconciler(inboundState, state, reducedState, config)
            : reducedState

        let newState = {
          ...reconciledRest,
          _persist: { ..._persist, rehydrated: true },
        }
        return conditionalUpdate(newState)
      }
    }

    // if we have not already handled PERSIST, straight passthrough
    if (!_persist) return baseReducer(state, action)

    // run base reducer:
    // is state modified ? return original : return updated
    let newState = baseReducer(restState, action)
    if (newState === restState) return state
    else {
      newState._persist = _persist
      return conditionalUpdate(newState)
    }
  }
}
