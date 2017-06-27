// @flow

import type {
  PersistConfig,
  MigrationManifest,
  RehydrateAction,
  RehydrateErrorType,
} from './types'

import { createStore } from 'redux'
import persistReducer from './persistReducer'
import { PERSIST, PURGE, REGISTER, REHYDRATE } from './constants'

type PendingRehydrate = [Object, RehydrateErrorType, PersistConfig]
type Persist = <R>(PersistConfig, MigrationManifest) => R => R
type CreatePersistor = Object => void

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

export default function persistStore(store: Object) {
  let persistor = createStore(persistorReducer, undefined)
  persistor.purge = () => {
    store.dispatch({
      type: PURGE,
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
  }

  store.dispatch({ type: PERSIST, register, rehydrate })

  return persistor
}
