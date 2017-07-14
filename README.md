This is WIP documentation for redux-persist v5, a major api change proposed for redux-persist. You can install this via `npm i redux-persist@proto`. Feedback is welcome.

[v4](https://github.com/rt2zz/redux-persist/tree/v4.8.2) will be supported for the forseeable future, and if it works well for your use case you are encouraged to stay on v4 until v5 is fully ready and battle tested.

## Migration from v4 to v5
Standard Usage:
- remove autoRehydrate
- remove config and callback from `persistStore` invocation
- apply `persistReducer(config, baseReducer)` to your reducer
- add `key` to the persist config (which is required by persistReducer)

The most difficult piece to migrate is if you previously depended on the callback argument of persistStore. Instead you should rely on checking when `persistorState.bootstrapped === true` as PersistGate does. If you feel the callback is still required for your use case please open an issue and we can consider its re-inclusion.

If your implementatation uses getStoredState + createPersistor see [alternate migration]('./docs/migration-alternate.md)

## Usage
```js
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/es/storage'
import rootReducer from './rootReducer'

const config = {
  key: 'root', // key is required
  storage, // storage is now required
}

const reducer = persistReducer(config, rootReducer)

function configureStore () {
  // ...
  let store = createStore(reducer)

  persistStore(store)
}
```

## Breaking Changes
There are two important breaking changes. 
1. api has changed as described in the above migration section
2. rehydration no longer shallow merges child state. In practice this means if you use `combineReducers`, by default new initialState will not be preserved after rehydration. This is necessary because we no longer require persist be configured at the top level reducer. If you require your sub-reducers to be shallow merged please open an issue and we can discuss. One option is to enable pluggable `stateReconcilers`. Another option is that we ship an alternative version of `combineReducers` that handles this.

## Why v5
Long story short, the changes are required in order to support new use cases
- code splitting reducers
- easier to ship persist support inside of other libs (e.g. redux-offline)
- ability to colocate persistence rules with the reducer it pertains to
- first class migration support
- enable PersistGate react component which blocks rendering until persistence is complete (and enables similar patterns for integration)
- possible to nest persistence
- gaurantee consistent state atoms
- better debugability and extensibility

