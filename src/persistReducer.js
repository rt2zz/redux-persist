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
  migrations: MigrationManifest = {},
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

  const version = config.version || DEFAULT_VERSION
  const debug = config.debug || false
  let _persistoid = null
  let _purge = false

  // $FlowFixMe perhaps there is a better way to do this?
  let defaultState = baseReducer(undefined, {
    type: 'redux-persist/default-probe',
  })
  if (process.env.NODE_ENV !== 'production') {
    if (Array.isArray(defaultState) || typeof defaultState !== 'object')
      console.error(
        'redux-persist: does not yet support non plain object state.'
      )
  }
  return (state: State = defaultState, action: Action) => {
    let { _persist, ...rest } = state || {}
    let restState: State = rest

    switch (action.type) {
      case PERSIST:
        if (state._persist) {
          console.warn(
            'redux-persist: unexpected _persist state before PERSIST action is handled. If you are doing hmr or code-splitting this may be a valid use case. Please open a ticket, requires further review.'
          )
          return state
        }
        if (typeof action.rehydrate !== 'function')
          throw new Error(
            'redux-persist: action.rehydrate is not a function. This can happen if the action is being replayed. This is an unexplored use case, please open an issue and we will figure out a resolution.'
          )
        if (typeof action.register !== 'function')
          throw new Error(
            'redux-persist: action.register is not a function. This can happen if the action is being replayed. This is an unexplored use case, please open an issue and we will figure out a resolution.'
          )

        let rehydrate = action.rehydrate
        action.register(config.key)

        getStoredState(config, (err, restoredState) => {
          _persistoid = createPersistoid(config)
          const migrate = config.migrate || ((s, v) => Promise.resolve(s))
          migrate(restoredState, version).then((migratedState, migrateErr) => {
            if (process.env.NODE_ENV !== 'production' && migrateErr)
              console.error('redux-persist: migration error', migrateErr)
            action.rehydrate(config.key, migratedState, err || migrateErr)
          })
        })

        return { ...state, _persist: { version, rehydrated: false } }

      case REHYDRATE:
        // noop if purging
        if (_purge) return state

        // @NOTE if key does not match, will continue to default case
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

      case PURGE:
        _purge = true
        purgeStoredState(config)
        return state

      default:
        // @TODO more performant workaround for combineReducers warning
        let newState = {
          ...baseReducer(restState, action),
          _persist,
        }
        _persistoid && _persistoid.update(newState)
        return newState
    }
  }
}
