# Redux Persist API

### `persistReducer(config, reducer)`

```js
persistReducer(
  config: PersistConfig,
  reducer: Reducer,
): Reducer
```

Where Reducer is any reducer `(state, action) => state` and 
A higher order reducer. 

### `type PersistConfig`
```js
{
  key: string, // the key for the persist
  storage: Object, // the storage adapter, following the AsyncStorage api
  
  version?: number, // the state version as an integer (defaults to -1)
  blacklist?: Array<string>, // do not persist these keys
  whitelist?: Array<string>, // only persist they keys
  transforms?: Array<Transform>,
  throttle?: number,
  keyPrefix?: string, // will be prefixed to the storage key
  debug?: boolean, // true -> verbose logs
}
```