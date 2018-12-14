# Redux Persist API
---
## Standard API
- [persistReducer](#persistreducerconfig-reducer)([config](#type-persistconfig), reducer)
- [persistStore](#persiststorestore-config-callback)(store)
- [createMigrate](#createmigratemigrations-config)([migrations](#type-migrationmanifest))
### `persistReducer(config, reducer)`

```js
persistReducer(
  config: PersistConfig,
  reducer: Reducer,
): Reducer
```

Where Reducer is any reducer `(state, action) => state` and PersistConfig is [defined below](#type-persistconfig)

### `persistStore(store, config, callback)`
```js
persistStore(
  store: Store,
  config?: { enhancer?: Function },
  callback?: () => {}
): Persistor
```

Where Persistor is [defined below](#type-persistor)

### `createMigrate(migrations, config)`
```js
createMigrate(
  migrations: MigrationManifest,
  config?: { debug: boolean }
)
```

### `type Persistor`
```js
{
  purge: () => Promise<void>,
  flush: () => Promise<void>,
}
```

The Persistor is a redux store unto itself, plus
1. the `purge()` method for clearing out stored state.
2. the `flush()` method for flushing all pending state serialization and immediately write to disk

`purge()` method only clear the content of the storage, leaving the internal data of `redux` untouched. To clean it instead, you can use the [redux-reset](https://github.com/wwayne/redux-reset) module.

### `type PersistConfig`
```js
{
  key: string, // the key for the persist
  storage: Object, // the storage adapter, following the AsyncStorage api
  version?: number, // the state version as an integer (defaults to -1)
  blacklist?: Array<string>, // do not persist these keys
  whitelist?: Array<string>, // only persist these keys
  migrate?: (Object, number) => Promise<Object>,
  transforms?: Array<Transform>,
  throttle?: number, // ms to throttle state writes
  keyPrefix?: string, // will be prefixed to the storage key
  debug?: boolean, // true -> verbose logs
  stateReconciler?: false | StateReconciler, // false -> do not automatically reconcile state
  serialize?: boolean, // false -> do not call JSON.parse & stringify when setting & getting from storage
  writeFailHandler?: Function, // will be called if the storage engine fails during setItem()
}
```

Persisting state involves calling setItem() on the storage engine. By default, this will fail silently if the storage/quota is exhausted.  
Provide a writeFailHandler(error) function to be notified if this occurs.

### `type MigrationManifest`
```js
{
  [number]: (State) => State
}
```
Where the keys are state version numbers and the values are migration functions to modify state.

---
## Expanded API
The following methods are used internally by the standard api. They can be accessed directly if more control is needed.
### `getStoredState(config)`
```js
getStoredState(
  config: PersistConfig
): Promise<State>
```

Returns a promise (if Promise global is defined) of restored state.

### `createPersistoid(config)`
```js
createPersistoid(
  config
): Persistoid
```
Where Persistoid is [defined below](#type-persistoid).

### `type Persistoid`
```js
{
  update: (State) => void
}
```

### `type PersistorConfig`
```js
{
  enhancer: Function
}
```
Where enhancer will be sent verbatim to the redux createStore call used to create the persistor store. This can be useful for example to enable redux devtools on the persistor store.

### `type StateReconciler`
```js
(
  inboundState: State,
  originalState: State,
  reducedState: State,
) => State
```
A function which reconciles:
- **inboundState**: the state being rehydrated from storage
- **originalState**: the state before the REHYDRATE action
- **reducedState**: the store state *after* the REHYDRATE action but *before* the reconcilliation
into final "rehydrated" state.
