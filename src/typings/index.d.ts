declare module 'redux-persist' {
  export * from 'redux-persist/constants';
  import { PersistConfig, PersistState, Persistoid } from 'redux-persist/types';

  export { default as createMigrate } from 'redux-persist/createMigrate';
  export { default as createTransform } from 'redux-persist/createTransform';
  export { default as persistCombineReducers } from 'redux-persist/persistCombineReducers';
  export { default as persistReducer } from 'redux-persist/persistReducer';
  export { default as persistStore } from 'redux-persist/persistStore';
  
  export function createPersistoid(config: PersistConfig): Persistoid;
  export function getStoredState(config: PersistConfig): Promise<Object | void>;
  export function purgeStoredState(config: PersistConfig): void;
}
