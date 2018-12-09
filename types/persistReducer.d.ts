declare module "redux-persist/es/persistReducer" {
  import { Action, Reducer } from "redux";
  import { PersistState, PersistConfig } from "redux-persist/es/types";

  interface PersistPartial {
    _persist: PersistState;
  }

  /**
   * @desc It provides a way of combining the reducers, replacing redux's @see combineReducers
   * @param config persistence configuration
   * @param baseReducer reducer used to persist the state
   */
  // tslint:disable-next-line: strict-export-declare-modifiers
  export default function persistReducer<S, A extends Action = Action>(config: PersistConfig<S>, baseReducer: Reducer<S, A>): Reducer<S & PersistPartial, A>;
}

declare module "redux-persist/lib/persistReducer" {
  export * from "redux-persist/es/persistReducer";
  export { default } from "redux-persist/es/persistReducer";
}
