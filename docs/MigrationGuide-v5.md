## v5 Breaking Changes
There are three important breaking changes.
1. api has changed as described in the [migration](#migration-from-v4-to-v5) section below.
2. state with cycles is no longer serialized using `json-stringify-safe`, and will instead noop.
3. state methods can no longer be overridden which means all top level state needs to be plain objects. `redux-persist-transform-immutable` will continue to operate as before as it works on substate, not top level state.

Additionally v5 does not yet have typescript bindings.

## Migration from v4 to v5
**WARNING** v4 stored state is not compatible with v5. If you upgrade a v4 application, your users will lose their stored state upon upgrade. You can try the (highly) experimental [v4 -> v5 state migration](#experimental-v4-to-v5-state-migration) if you please. Feedback appreciated.

Standard Usage:
- remove **autoRehydrate**
- changes to **persistStore**:
  - 1. remove config argument (or replace with an null if you are using a callback)
  - 2. remove all arguments from the callback. If you need state you can call `store.getState()`
  - 3. all constants (ex: `REHYDRATE`, `PURGE`) has moved from `redux-persist/constants` to the root module.
- replace `combineReducers` with **persistCombineReducers**
  - e.g. `let reducer = persistCombineReducers(config, reducers)`
- changes to **config**:
  - `key` is now required. Can be set to anything, e.g. 'primary'
  - `storage` is now required. For default storage: `import storage from 'redux-persist/lib/storage'`

```diff
-import { REHYDRATE, PURGE } from 'redux-persist/constants'
-import { combineReducers } from 'redux'
+import { REHYDRATE, PURGE, persistCombineReducers } from 'redux-persist'
+import storage from 'redux-persist/lib/storage' // or whatever storage you are using

 const config = {
+  key: 'primary',
+  storage
 }

-let reducer = combineReducers(reducers)
+let reducer = persistCombineReducers(config, reducers)

 const store = createStore(
   reducer,
   undefined,
   compose(
     applyMiddleware(...),
-    autoRehydrate()
   )
 )

 const callback = ()

 persistStore(
   store,
-  config,
+  null,
   (
-     err, restoredState
   ) => {
+     store.getState() // if you want to get restoredState
   }
 )
```

Recommended Additions
- use new **PersistGate** to delay rendering until rehydration is complete
  - `import { PersistGate } from 'redux-persist/lib/integration/react'`
- set `config.debug = true` to get useful logging

If your implementation uses getStoredState + createPersistor see [alternate migration](./v5-migration-alternate.md)

## Why v5
Long story short, the changes are required in order to support new use cases
- code splitting reducers
- easier to ship persist support inside of other libs (e.g. redux-offline)
- ability to colocate persistence rules with the reducer it pertains to
- first class migration support
- enable PersistGate react component which blocks rendering until persistence is complete (and enables similar patterns for integration)
- possible to nest persistence
- guarantee consistent state atoms
- better debugability and extensibility

## Experimental v4 to v5 State Migration
- **warning: this method is completely untested**
- v5 getStoredState is not compatible with v4, so by default v5 will cause all of the persisted state from v4 to disappear on first run
- v5 ships with an experimental v4 -> v5 migration that works by overriding the default getStoredState implementation
**Warning** this is completely untested, please try and report back with any issues.
```js
import getStoredStateMigrateV4 from 'redux-persist/lib/integration/getStoredStateMigrateV4'
// ...
persistReducer({
  // ...
  getStoredState: getStoredStateMigrateV4(yourOldV4Config)
}, baseReducer)
```
