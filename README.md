# Redux Persist

Persist and rehydrate a redux store.

[![build status](https://img.shields.io/travis/rt2zz/redux-persist/master.svg?style=flat-square)](https://travis-ci.org/rt2zz/redux-persist) [![npm version](https://img.shields.io/npm/v/redux-persist.svg?style=flat-square)](https://www.npmjs.com/package/redux-persist) [![npm downloads](https://img.shields.io/npm/dm/redux-persist.svg?style=flat-square)](https://www.npmjs.com/package/redux-persist)

Redux Persist takes your redux state object and saves it to persisted storage. On app launch, it retrieves this persisted state and saves it back to redux.

**Note:** These instructions are for redux-persist v5. For a list of breaking changes between v4 and v5, see our [migration guide](./docs/MigrationGuide-v5.md).
[v4](https://github.com/rt2zz/redux-persist/tree/v4.8.2) will be supported for the forseeable future, and if it works well for your use case you are encouraged to stay on v4.

## Quickstart
`npm install --save redux-persist`
\- OR -
`yarn add redux-persist`

##### Implementation
Basic implementation involves adding `persistReducer` and `persistStore` to your setup. **IMPORTANT** Every app needs to decide how many levels of state they want to "merge". The default is 1 level. Please read through the [state reconciler docs](#state-reconciler) for more information.

```js
// configureStore.js

import { createStore } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import rootReducer from './reducers'

const persistConfig = {
  key: 'root',
  storage: storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export default () => {
  let store = createStore(persistedReducer)
  let persistor = persistStore(store)
  return { store, persistor }
}
```

If you are using react, wrap your root component with [PersistGate](./docs/PersistGate.md). This delays the rendering of your app's UI until your persisted state has been retrieved and saved to redux.

```js
import React from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/lib/integration/react'

import configureStore from './store/configureStore'
let { store, persistor } = configureStore()

// import your necessary custom components.
import { RootComponent } from './components'

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootComponent />
      </PersistGate>
    </Provider>
  );
};

export default App
```

**NOTE** loading is set to null for simplicity, but in practice should be any react instance, e.g. `loading={<SomeLoadingIcon />}`

## State Reconciler
State reconcilers define how incoming persisted state is merged in with existing default state. It is critical to choose the right state reconciler for your state shape. There are three options that ship out of the box, lets look at how each operates:

1. hardSet (`import hardSet from 'redux-persist/lib/stateReconciler/hardSet'`)
This will hard set incoming state. This can be desirable in some cases where persistReducer is nested deeper in your reducer tree, or if you do not rely on initialState in your reducer.
   - **INCOMING STATE**: `{ foo: incomingFoo }`
   - **INITIAL STATE**: `{ foo: initialFoo, bar: initialBar }`
   - **RECONCILED STATE**: `{ foo: incomingFoo }` // note bar has been dropped
2. autoMergeLevel1 (default)
This will auto merge one level deep. Auto merge means if the some piece of substate was modified by your reducer during the REHYDRATE action, it will skip this piece of state. Level 1 means it will shallow merge 1 level deep.
   - **INCOMING STATE**: `{ foo: incomingFoo }`
   - **INITIAL STATE**: `{ foo: initialFoo, bar: initialBar }`
   - **RECONCILED STATE**: `{ foo: incomingFoo, bar: initialBar }`
3. autoMergeLevel2
This acts just like autoMergeLevel1, except it shallow merges two levels
   - **INCOMING STATE**: `{ foo: incomingFoo }`
   - **INITIAL STATE**: `{ foo: initialFoo, bar: initialBar }`
   - **RECONCILED STATE**: `{ foo: mergedFoo, bar: initialBar }`

#### Example
```js
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/hardSet'

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: hardSet,
}
```

## Blacklist & Whitelist
By Example:
```js
// BLACKLIST
const persistConfig = {
  key: 'root',
  storage: storage,
  blacklist: ['navigation'] // navigation will not be persisted
};

// WHITELIST
const persistConfig = {
  key: 'root',
  storage: storage,
  whitelist: ['navigation'] // only navigation will be persisted
};
```

#### Nested Blacklist / Whitelist
The blacklist and whitelist only work one level deep. However persisted reducers can be nested.For example, if you want to blacklist `state.auth.somethingTemporary`:
```js
import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { authReducer, otherReducer } from './reducers'

const rootPersistConfig = {
  key: 'root',
  storage: storage,
  blacklist: ['auth']
}

const authPersistConfig = {
  key: 'auth',
  storage: storage,
  blacklist: ['somethingTemporary']
}

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  other: otherReducer,
})

export default persistReducer(rootPersistConfig, rootReducer)
```

## Migrations
`persistReducer` has a general purpose "migrate" config which will be called after getting stored state but before actually reconciling with the reducer. It can be any function which takes state as an argument and returns a promise to return a new state object.

Redux Persist ships with `createMigrate`, which helps create a synchronous migration for moving from any version of stored state to the current state version. [[Additional information]](./docs/migrations.md)

## Transforms

Transforms allow you to customize the state object that gets persisted and rehydrated.

There are several libraries that tackle some of the common implementations for transforms.
- [immutable](https://github.com/rt2zz/redux-persist-transform-immutable) - support immutable reducers
- [compress](https://github.com/rt2zz/redux-persist-transform-compress) - compress your serialized state with lz-string
- [encrypt](https://github.com/maxdeviant/redux-persist-transform-encrypt) - encrypt your serialized state with AES
- [filter](https://github.com/edy/redux-persist-transform-filter) - store or load a subset of your state
- [filter-immutable](https://github.com/actra-development/redux-persist-transform-filter-immutable) - store or load a subset of your state with support for immutablejs
- [expire](https://github.com/gabceb/redux-persist-transform-expire) - expire a specific subset of your state based on a property

When the state object gets persisted, it first gets serialized with `JSON.stringify()`. If parts of your state object are not mappable to JSON objects, the serialization process may transform these parts of your state in unexpected ways. For example, the javascript [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) type does not exist in JSON. When you try to serialize a Set via `JSON.stringify()`, it gets converted to an empty object. Probably not what you want.

Below is a Transform that successfully persists a Set property, which simply converts it to an array and back. In this way, the Set gets converted to an Array, which is a recognized data structure in JSON. When pulled out of the persisted store, the array gets converted back to a Set before being saved to the redux store.

```js
const myTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    // convert mySet to an Array.
    return { ...inboundState, mySet: [...inboundState.mySet] };
  },
  // transform state being rehydrated
  (outboundState, key) => {
    // convert mySet back to a Set.
    return { ...outboundState, mySet: new Set(outboundState.mySet) };
  },
  // define which reducers this transform gets called for.
  { whitelist: ['someReducer'] }
);
```

The createTransform function takes three parameters.
1. A function that gets called right before state is persisted.
2. A function that gets called right before state is rehydrated.
3. A config object.

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
- **[redux-persist-cookie-storage](https://github.com/abersager/redux-persist-cookie-storage)** Cookie storage engine, works in browser and Node.js, for universal / isomorphic apps
- **custom** any conforming storage api implementing the following methods: `setItem` `getItem` `removeItem`. (**NB**: These methods must support promises)
