## Redux Persist API
- -- core
- [persistStore(store, config, callback)](#persistStore) -> persistor
- [autoRehydrate()](#autoRehydrate) -> redux store enhancer
- -- advanced
- [getStoredState(config, callback)](#getStoredState) -> Promise -> state
- [createPersistor(store, config)](#createPersistor) -> persistor
- [createTransform(in, out, config)](#createTransform) -> transform
- -- objects
- [config](#config)
- [persistor](#persistor)
- [transform](#transform)

##### persistStore(store, config, callback)
Get stored state, fire a rehydrate action, and begin persisting redux state.
```js
let persistor = persistStore(store, {}, (err, state) => {})
```
##### autoRehydrate()
Handle the rehydrate action. By default will shallow merge rehydrate state into initial state. If a reducer handles the rehydrate action, autoRehydrate will skip that reducer.
```js
let store = createStore(reducer, initialState, autoRehydrate())
```

##### getStoredState(config, callback)
Get and stored state from storage. Can be used to get state in order to pass into redux initialState.
```js
// with callbacks
getStoredState(config, (err, state) => {})

// with async await
let state = await getStoredState(config)
```

##### createPersistor(store, config)
Creates a persistor object and begin storing redux state.
```js
let persistor = createPersistor(store, config)
```

##### createTransform(in, out, config)
Creates a transform object for plugging in to config.transforms.
```js
let counterTransform = createTransform(
  (state) => ({...state, saveCounter: state.saveCounter + 1}),
  (state) => ({...state, rehydrateCounter: state.rehydrateCounter + 1}),
  { whitelist: 'reducerA'}
)

persistStore(store, { transforms: counterTransform })
```

##### config {}
```js
{
  whitelist: ['reducerA'],
  blacklist: ['reducerB'],
  transforms: [transformA],
  storage: AsyncStorage,
  debounce: 33,
}
```

##### persistor {}
```js
persistor.rehydrate(incomingState, {serial: true})
persistor.purgeAll()
persistor.pause()
persistor.resume()
```

##### transform {}
```
{
  in: (state, key) => newState,
  out: (state, key) => newState,
}
```
