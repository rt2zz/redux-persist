declare module "redux-persist/es/purgeStoredState" {
  import { PersistConfig } from "redux-persist/es/types";
  /**
   * @desc Removes stored state.
   * @param config persist configuration
   */
  // tslint:disable-next-line: strict-export-declare-modifiers
  export default function purgeStoredState<S>(config: PersistConfig<S>): any;
}

declare module "redux-persist/lib/purgeStoredState" {
  export * from "redux-persist/es/purgeStoredState";
  export { default } from "redux-persist/es/purgeStoredState";
}
