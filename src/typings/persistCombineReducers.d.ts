declare module 'redux-persist/persistCombineReducers' {
  import { PersistConfig } from 'redux-persist/types';

  type Reducers = { [key: string]: Function };
  type ReducersCombiner = (state: Object, action: Object) => Object;

  export default function persistCombineReducers(
    config: PersistConfig,
    reducers: Reducers
  ): ReducersCombiner;
}