declare module 'redux-persist/persistStore' {
  import { Persistor, PersistorOptions } from 'redux-persist/types';

  export default function persistStore(
    store: Object,
    persistorOptions?: PersistorOptions,
    cb?: () => any
  ): Persistor;
}