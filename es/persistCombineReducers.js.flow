// @flow

import { combineReducers } from 'redux'
import persistReducer from './persistReducer'
import autoMergeLevel2 from './stateReconciler/autoMergeLevel2'

import type { PersistConfig } from './types'

type Reducers = {
  [key: string]: Function,
}

type Reducer = (state: Object, action: Object) => Object

// combineReducers + persistReducer with stateReconciler defaulted to autoMergeLevel2
export default function persistCombineReducers(
  config: PersistConfig,
  reducers: Reducers
): Reducer {
  config.stateReconciler =
    config.stateReconciler === undefined
      ? autoMergeLevel2
      : config.stateReconciler
  return persistReducer(config, combineReducers(reducers))
}
