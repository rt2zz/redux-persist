import { combineReducers } from 'redux';
import persistReducer from './persistReducer';
import autoMergeLevel2 from './stateReconciler/autoMergeLevel2';

// combineReducers + persistReducer with stateReconciler defaulted to autoMergeLevel2
export default function persistCombineReducers(config, reducers) {
  config.stateReconciler = config.stateReconciler === undefined ? autoMergeLevel2 : config.stateReconciler;
  return persistReducer(config, combineReducers(reducers));
}