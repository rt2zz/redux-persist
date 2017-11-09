# Redux Persist
Persist and rehydrate a redux store.

Redux Persist is [performant](#why-redux-persist), easy to [implement](#basic-usage), and easy to [extend](./docs/ecosystem.md).

`npm i redux-persist`  

[![build status](https://img.shields.io/travis/rt2zz/redux-persist/master.svg?style=flat-square)](https://travis-ci.org/rt2zz/redux-persist)
[![npm version](https://img.shields.io/npm/v/redux-persist.svg?style=flat-square)](https://www.npmjs.com/package/redux-persist)
[![npm downloads](https://img.shields.io/npm/dm/redux-persist.svg?style=flat-square)](https://www.npmjs.com/package/redux-persist)

**Note:** These docs apply to redux-persist v5. [v4](https://github.com/rt2zz/redux-persist/tree/v4.8.2) will be supported for the forseeable future, and if it works well for your use case you are encouraged to stay on v4.

## Usage
[API Docs](./docs/api.md)
```js
import { persistStore, persistCombineReducers } from 'redux-persist'
import storage from 'redux-persist/es/storage' // default: localStorage if web, AsyncStorage if react-native
import reducers from './reducers' // where reducers is an object of reducers

const config = {
  key: 'root',
  storage,
}

const reducer = persistCombineReducers(config, reducers)

function configureStore () {
  // ...
  let store = createStore(reducer)
  let persistor = persistStore(store)
  
  return { persistor, store }
}
```

Additionally if you are using react, it is recommended you use the provided [PersistGate](./docs/PersistGate.md) component for integration. This will take care of delaying the rendering of the app until rehydration is complete.
```js
class App extends Component {
  //...
  render() {
    return (
      <PersistGate persistor={persistor}>
        {/* rest of app */}
      </PersistGate>
    )
  }
}
```

Additional Usage Examples:
1. [Nested Persists](#nested-persists)
3. Code Splitting [coming soon]
4. Hot Module Reloading [coming soon]

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
  - 1. remove config argument (or replace with an empty object)
  - 2. remove all arguments from the callback. If you need state you can call `store.getState()`
  - 3. All constants (ex: `{REHYDRATE, PURGE}`) has moved to `redux-persist/lib/constants` instead of `redux-persist/constants`
- replace combineReducers with **persistCombineReducers**
  - e.g. `let reducer = persistCombineReducers(config, reducers)`
- changes to **config**:
  - `key` is now required. Can be set to anything, e.g. 'primary'
  - `storage` is now required. For default storage: `import storage from 'redux-persist/lib/storage'`

Recommended Additions
- use new **PersistGate** to delay rendering until rehydration is complete
  - `import { PersistGate } from 'redux-persist/lib/integration/react'`
- set `config.debug = true` to get useful logging

If your implementatation uses getStoredState + createPersistor see [alternate migration](./docs/v5-migration-alternate.md)

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

## Migrations
`persistReducer` has a general purpose "migrate" config which will be called after getting stored state but before actually reconciling with the reducer. It can be any function which takes state as an argument and returns a promise to return a new state object.

Redux Persist ships with `createMigrate`, which helps create a synchronous migration for moving from any version of stored state to the current state version. [[Additional information]](./docs/migrations.md)

## Nested Persists
Persistence can now be nested, allowing for multiple persistoids with differing configuration to easily coexist.
```js
import { combineReducers } from 'redux' 
import { persistReducer } from 'redux-persist'
import session from 'redux-persist/lib/storage/session'
import localForage from 'localforage'

import { fooReducer, barReducer } from './reducers'

// foo state to be stored in localForage, but lets not persist someEmphemeralKey
const fooPersistConfig = {
  key: 'foo',
  storage: localForage,
  blacklist: ['someEphemeralKey'],
}

// bar state should only last for the tab session
const barPersistConfig = {
  key: 'bar',
  storage: session,
}

let rootReducer = combineReducers({
  foo: persistReducer(fooPersistConfig, fooReducer),
  bar: persistReducer(barPersistConfig, barReducer),
})
```

Additionally depending on the mount point of persistReducer, you may not want to reconcile state at all.
```
import { hardSet } from 'redux-persist/lib/stateReconciler/hardSet'

//...

const fooConfig = {
  key: 'foo',
  storage: localForage,
  stateReconciler: hardSet,
}

let reducer = combineReducer({
  foo: persistReducer(fooConfig, fooReducer)
})
```

## Experimental v4 to v5 State Migration
- **warning: this method is completely untested**
- v5 getStoredState is not compatible with v4, so by default v5 will cause all of the persisted state from v4 to disappear on first run
- v5 ships with an experimental v4 -> v5 migration that works by overriding the default getStoredState implementation
**Warning** this is completely untested, please try and report back with any issues.
```js
import getStoredStateMigrateV4 from 'redux-persist/lib/integration/getStoredStateMigratev4'
// ...
persistReducer({
  // ...
  getStoredState: getStoredStateMigrateV4(yourOldV4Config)
}, baseReducer)
```

## Storage Engines
- **localStorage** `import storage from 'redux-persist/lib/storage'`
- **sessionStorage** `import sessionStorage from 'redux-persist/lib/storage/session'`
- **AsyncStorage** react-native `import storage from 'redux-persist/lib/storage'`
- **[localForage](https://github.com/mozilla/localForage)** recommended for web
- **[electron storage](https://github.com/psperber/redux-persist-electron-storage)** Electron support via [electron store](https://github.com/sindresorhus/electron-store)
- **[redux-persist-filesystem-storage](https://github.com/robwalkerco/redux-persist-filesystem-storage)** react-native, to mitigate storage size limitations in android ([#199](https://github.com/rt2zz/redux-persist/issues/199), [#284](https://github.com/rt2zz/redux-persist/issues/284))
- **[redux-persist-node-storage](https://github.com/pellejacobs/redux-persist-node-storage)** for use in nodejs environments.
- **[redux-persist-sensitive-storage](https://github.com/CodingZeal/redux-persist-sensitive-storage)** react-native, for sensitive information (uses [react-native-sensitive-storage](https://github.com/mCodex/react-native-sensitive-info)).
- **[redux-persist-fs-storage](https://github.com/leethree/redux-persist-fs-storage)** react-native-fs engine
- **custom** any conforming storage api implementing the following methods: `setItem` `getItem` `removeItem`. (**NB**: These methods must support promises)


## Transforms
Transforms allow for arbitrary state transforms before saving and during rehydration.
- [immutable](https://github.com/rt2zz/redux-persist-transform-immutable) - support immutable reducers
- [compress](https://github.com/rt2zz/redux-persist-transform-compress) - compress your serialized state with lz-string
- [encrypt](https://github.com/maxdeviant/redux-persist-transform-encrypt) - encrypt your serialized state with AES
- [filter](https://github.com/edy/redux-persist-transform-filter) - store or load a subset of your state
- [filter-immutable](https://github.com/actra-development/redux-persist-transform-filter-immutable) - store or load a subset of your state with support for immutablejs
- [expire](https://github.com/gabceb/redux-persist-transform-expire) - expire a specific subset of your state based on a property
- custom transforms:
```js
import { createTransform, persistReducer } from 'redux-persist'

let myTransform = createTransform(
  // transform state coming from redux on its way to being serialized and stored
  (state, key) => specialSerialize(state, key),
  // transform state coming from storage, on its way to be rehydrated into redux
  (state, key) => specialDeserialize(state, key),
  // configuration options
  {whitelist: ['specialKey']}
)

const reducer = persistReducer({transforms: [myTransform]}, baseReducer)
```
