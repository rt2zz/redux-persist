import { Action, CombinedState, combineReducers, ReducersMapObject } from 'redux'
import persistReducer from './persistReducer'
import autoMergeLevel2 from './stateReconciler/autoMergeLevel2'

import type { 
  PersistConfig,
  PersistedState
} from './types'

// combineReducers + persistReducer with stateReconciler defaulted to autoMergeLevel2
export default function persistCombineReducers<S, A extends Action>(
  config: PersistConfig<any>,
  reducers: ReducersMapObject<CombinedState<S>, Action<any>>
) {
  config.stateReconciler =
    config.stateReconciler === undefined
      ? autoMergeLevel2
      : config.stateReconciler
  return persistReducer(config, combineReducers(reducers))
}
