// @flow

import { combineReducers as baseCombineReducers } from 'redux'
import persistReducer from './persistReducer'
import autoMergeLevel2 from './stateReconciler/autoMergeLevel2'

import type { PersistConfig } from './types'

type Reducers = {
  [key: string]: Function,
}

type Reducer = (state: Object, action: Object) => Object

// combineReudcers + persistReducer with stateReconciler defaulted to autoMergeLevel2
export default function persistCombineReducers(
  config: PersistConfig,
  reducers: Reducers
): Reducer {
  config.stateReconciler = config.stateReconciler || autoMergeLevel2
  combineReducers = config.combineReducers || baseCombineReducers;
  return persistReducer(config, combineReducers(reducers))
}
