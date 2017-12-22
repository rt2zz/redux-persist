# Redux Persist

Persist and rehydrate a redux store.

[![build status](https://img.shields.io/travis/rt2zz/redux-persist/master.svg?style=flat-square)](https://travis-ci.org/rt2zz/redux-persist) [![npm version](https://img.shields.io/npm/v/redux-persist.svg?style=flat-square)](https://www.npmjs.com/package/redux-persist) [![npm downloads](https://img.shields.io/npm/dm/redux-persist.svg?style=flat-square)](https://www.npmjs.com/package/redux-persist)

Redux Persist takes your redux state object and saves it to persisted storage. On app launch, it retrieves this persisted state and saves it back to redux.

**Note:** These instructions are for redux-persist v5. For a list of breaking changes between v4 and v5, see our [migration guide](./docs/MigrationGuide-v5.md).
[v4](https://github.com/rt2zz/redux-persist/tree/v4.8.2) will be supported for the forseeable future, and if it works well for your use case you are encouraged to stay on v4.

## Quickstart
##### Install package
`npm install --save redux-persist`
\- OR -
`yarn add redux-persist`

##### Implementation
When creating your redux store, pass your [createStore](https://redux.js.org/docs/api/createStore.html) function a PersistReducer that wraps your app's root reducer.
Once your store is created, pass it to the `persistStore` function, which ensures your redux state is saved to persisted storage whenever it changes.

```js
import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import rootReducer from './reducers'; // the value from combineReducers

const persistConfig = {
  key: 'root',
  storage: storage,
  stateReconciler: autoMergeLevel2
};

const persistReducer = persistReducer(persistConfig, rootReducer);
export const store = createStore(persistReducer);
export const persistor = persistStore(store);
```

If you are using react, wrap your root component with [PersistGate](./docs/PersistGate.md). This delays the rendering of your app's UI until your persisted state has been retrieved and saved to redux.

```js
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';

// import the two exports from the last code snippet.
import { persistor, store } from './store';

// import your necessary custom components.
import { RootComponent, LoadingView } from './components';

const App = () => {
  return (
    <Provider store={store}>
      // the loading and persistor props are both required!
      <PersistGate loading={<LoadingView />} persistor={persistor}>
        <RootComponent />
      </PersistGate>
    </Provider>
  );
};

export default App;
```

## Customizing what is persisted
If you don't want to persist a part of your state, you could put it in the blacklist. The blacklist is added into the config object that we used when setting up our PersistReducer.

```js
const persistConfig = {
  key: 'root',
  storage: storage,
  blacklist: ['navigation']
};

const persistReducer = persistReducer(persistConfig, rootReducer);
export const store = createStore(persistReducer);
export const persistor = persistStore(store);
```

The blacklist takes an array of strings. Each string must match a part of state that is managed by the reducer you pass to `persistReducer`. For the example above, if `rootReducer` was created via the [combineReducers](https://redux.js.org/docs/api/combineReducers.html) function, we would expect ‘navigation’ to appear there, like so.

`combineReducers({ auth: AuthReducer, navigation: NavReducer, notes: NotesReducer });`

The whitelist is set up in the same way as the blacklist, except that it defines the parts of state that you do want to persist.

```js
const persistConfig = {
  key: 'root',
  storage: storage,
  whitelist: ['auth', 'notes']
};
```

What if you wanted to blacklist a nested property though?
For example, let's say your state object has an auth key and that you want to persist `auth.currentUser` but NOT `auth.isLoggingIn`.

To do this, wrap your AuthReducer with a PersistReducer, and then blacklist the `isLoggingIn` key. This allows you to co-locate your persistence rules with the reducer it pertains to.

```js
// AuthReducer.js
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';

const INITIAL_STATE = {
  currentUser: null,
  isLoggingIn: false
};

const AuthReducer = (state = INITIAL_STATE, action) => {
  // reducer implementation
};

const persistConfig = {
  key: 'auth',
  storage: storage,
  blacklist: ['isLoggingIn']
};

export default persistReducer(persistConfig, AuthReducer);
```

If you prefer to have all your persistence rules in one place, instead of co-located with their associated reducer, consider putting it all with your `combineReducers` function:

```js
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import { authReducer, navReducer, notesReducer } from './reducers'

const rootPersistConfig = {
  key: 'root',
  storage: storage,
  blacklist: ['navigation']
};

const authPersistConfig = {
  key: 'auth',
  storage: storage,
  blacklist: ['isLoggingIn']
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  navigation: navReducer,
  notes: notesReducer
});

export default persistReducer(rootPersistConfig, rootReducer);
```

## Migrations
`persistReducer` has a general purpose "migrate" config which will be called after getting stored state but before actually reconciling with the reducer. It can be any function which takes state as an argument and returns a promise to return a new state object.

Redux Persist ships with `createMigrate`, which helps create a synchronous migration for moving from any version of stored state to the current state version. [[Additional information]](./docs/migrations.md)

Additionally depending on the mount point of persistReducer, you may not want to reconcile state at all.
```js
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

## Advanced Customization
### Transforms

Transforms allow you to customize the state object that gets persisted and rehydrated.

​When the state object gets persisted, it first gets serialized with `JSON.stringify()`. If parts of your state object are not mappable to JSON objects, the serialization process may transform these parts of your state in unexpected ways. For example, the javascript [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) type does not exist in JSON. When you try to serialize a Set via `JSON.stringify()​`, it gets converted to an empty object. Probably not what you want.

Below is a Transform that successfully persists a Set​ property, which simply converts it to an array and back. In this way, the Set gets converted to an Array, which is a recognized data structure in JSON. When pulled out of the persisted store, the array gets converted back to a Set before being saved to the redux store.

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

There are several libraries that tackle some of the common implementations for transforms.
- [immutable](https://github.com/rt2zz/redux-persist-transform-immutable) - support immutable reducers
- [compress](https://github.com/rt2zz/redux-persist-transform-compress) - compress your serialized state with lz-string
- [encrypt](https://github.com/maxdeviant/redux-persist-transform-encrypt) - encrypt your serialized state with AES
- [filter](https://github.com/edy/redux-persist-transform-filter) - store or load a subset of your state
- [filter-immutable](https://github.com/actra-development/redux-persist-transform-filter-immutable) - store or load a subset of your state with support for immutablejs
- [expire](https://github.com/gabceb/redux-persist-transform-expire) - expire a specific subset of your state based on a property

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
