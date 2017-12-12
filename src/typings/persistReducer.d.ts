declare module 'redux-persist/persistReducer' {
  import { PersistConfig, PersistState } from 'redux-persist/types';
  
  type PersistPartial = { _persist: PersistState };
  type PersistReducerType<S, A> = (state: S, action: A) => S & PersistPartial;

  export function persistReducer<S extends Object, A extends Object>(
    config: PersistConfig,
    baseReducer: (state: S | void, action: A) => S
  ): PersistReducerType<S, A>;
}