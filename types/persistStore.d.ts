declare module "redux-persist/es/persistStore" {
  import { Store } from 'redux';
  import { PersistorOptions, Persistor } from "redux-persist/es/types";

  /**
   * @desc Creates a persistor for a given store.
   * @param store store to be persisted (or match an existent storage)
   * @param persistorOptions enhancers of the persistor
   * @param callback bootstrap callback of sort.
   */
  // tslint:disable-next-line: strict-export-declare-modifiers
  export default function persistStore(store: Store, persistorOptions?: PersistorOptions | null, callback?: () => any): Persistor;
}

declare module "redux-persist/lib/persistStore" {
  export * from "redux-persist/es/persistStore";
  export { default } from "redux-persist/es/persistStore";
}
