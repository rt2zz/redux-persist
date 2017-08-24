[v5](https://github.com/rt2zz/redux-persist/tree/v5) is on the way! It is a major api change, so please read the notes carefully and open an issue if you have questions or concerns. The new api will allow for code splitting, better lib integrations, and colocating persistence rules with each reducer. [Check it out now](https://github.com/rt2zz/redux-persist/tree/v5)!

# Redux Persist
Persist and rehydrate a redux store.

Redux Persist is [performant](#why-redux-persist), easy to [implement](#basic-usage), and easy to [extend](./docs/ecosystem.md).

`npm i --save redux-persist`

[![build status](https://img.shields.io/travis/rt2zz/redux-persist/master.svg?style=flat-square)](https://travis-ci.org/rt2zz/redux-persist)
[![npm version](https://img.shields.io/npm/v/redux-persist.svg?style=flat-square)](https://www.npmjs.com/package/redux-persist)
[![npm downloads](https://img.shields.io/npm/dm/redux-persist.svg?style=flat-square)](https://www.npmjs.com/package/redux-persist)

## Basic Usage
Basic usage requires adding a few lines to a traditional redux application:
```js
import {compose, applyMiddleware, createStore} from 'redux'
import {persistStore, autoRehydrate} from 'redux-persist'

// add `autoRehydrate` as an enhancer to your store (note: `autoRehydrate` is not a middleware)
const store = createStore(
  reducer,
  undefined,
  compose(
    applyMiddleware(...),
    autoRehydrate()
  )
)

// begin periodically persisting the store
persistStore(store)
```
For per reducer rehydration logic, you can opt-in by adding a handler to your reducer:
```js
import {REHYDRATE} from 'redux-persist/constants'
//...
case REHYDRATE:
  var incoming = action.payload.myReducer
  if (incoming) return {...state, ...incoming, specialKey: processSpecial(incoming.specialKey)}
  return state
```
You may also need to configure the persistence layer, or take action after rehydration has completed:
```js
persistStore(store, {blacklist: ['someTransientReducer']}, () => {
  console.log('rehydration complete')
})
```
And if things get out of wack, just purge the storage
```js
persistStore(store, config, callback).purge()
```

## API
[Full API](./docs/api.md)
#### `persistStore(store, [config, callback])`
  - arguments
    - **store** *redux store* The store to be persisted.
    - **config** *object*
      - **blacklist** *array* keys (read: reducers) to ignore
      - **whitelist** *array* keys (read: reducers) to persist, if set all other keys will be ignored.
      - **storage** *object* a [conforming](https://github.com/rt2zz/redux-persist#storage-engines) storage engine.
      - **transforms** *array* transforms to be applied during storage and during rehydration.
      - **debounce** *integer* debounce interval applied to storage calls (in miliseconds).
      - **keyPrefix** *string* change localstorage default key (default: **reduxPersist:**) [Discussion on why we need this feature ?](https://github.com/rt2zz/redux-persist/issues/137)
    - **callback** *function* will be called after rehydration is finished.
  - returns **persistor** object

#### `persistor object`
  - the persistor object is returned by persistStore with the following methods:
    - `.purge(keys)`
      - **keys** *array* An array of keys to be purged from storage. If not provided all keys will be purged.
    - `.rehydrate(incoming, options)`
      - **incoming** *object* Data to be rehydrated into the store.
      - **options** *object* If `serial:true`, incoming should be a *string*, that will be deserialized and passed through the transforms defined in the persistor.
      - Manually rehydrates the store with the passed data, dispatching the rehydrate action.
    - `pause()`
      - pauses persistence
    - `resume()`
      - resumes persistence

#### `autoRehydrate(config)`
  - This is a store enhancer that will automatically shallow merge the persisted state for each key. Additionally it queues any actions that are dispatched before rehydration is complete, and fires them after rehydration is finished.
  - arguments
    - **config** *object*
      - **log** *boolean* Turn on debug mode. Default: *false*.
      - **stateReconciler** *function* override the default shallow merge state reconciliation.

#### `constants`
  - `import * as constants from 'redux-persist/constants'`. This includes `REHYDRATE` and `KEY_PREFIX`.

## Alternate Usage
#### getStoredState / createPersistor
If you need more control over persistence flow, you can implement `getStoredState` and `createPersistor`. For example you can skip autoRehydrate and directly pass restoredState into your store as initialState:

```js
import {getStoredState, autoRehydrate, createPersistor} from 'redux-persist'

const persistConfig = { /* ... */ }

getStoredState(persistConfig, (err, restoredState) => {
  const store = createStore(reducer, restoredState)
  const persistor = createPersistor(store, persistConfig)
})
```

#### Secondary Persistor
```js
import {persistStore, createPersistor} from 'redux-persist'
const persistor = persistStore(store) // persistStore restores and persists
const secondaryPersistor = createPersistor(store, {storage: specialBackupStorage}) // createPersistor only persists
```

## Storage Engines
- **localStorage** (default) web
- **sessionStorage**
- **[localForage](https://github.com/mozilla/localForage)** (recommended) web, see usage below
- **[AsyncStorage](http://facebook.github.io/react-native/docs/asyncstorage.html#content)** for react-native
- **[redux-persist-filesystem-storage](https://github.com/robwalkerco/redux-persist-filesystem-storage)** for use in react-native Android to mitigate storage size limitations ([#199](https://github.com/rt2zz/redux-persist/issues/199), [284](https://github.com/rt2zz/redux-persist/issues/284))
- **[redux-persist-node-storage](https://github.com/pellejacobs/redux-persist-node-storage)** for use in nodejs environments.
- **[redux-persist-sensitive-storage](https://github.com/CodingZeal/redux-persist-sensitive-storage)** for use in react-native for sensitive information (uses [react-native-sensitive-storage](https://github.com/mCodex/react-native-sensitive-info)).
- **custom** any conforming storage api implementing the following methods: `setItem` `getItem` `removeItem` `getAllKeys`. (**NB**: These methods must support callbacks, not promises.) [[example](https://github.com/facebook/react-native/blob/master/Libraries/Storage/AsyncStorage.js)]

```js
// sessionStorage
import { persistStore } from 'redux-persist'
import { asyncSessionStorage } from 'redux-persist/storages'
persistStore(store, {storage: asyncSessionStorage})

// react-native
import {AsyncStorage} from 'react-native'
persistStore(store, {storage: AsyncStorage})

// web with recommended localForage
import localForage from 'localforage'
persistStore(store, {storage: localForage})

```

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
import { createTransform, persistStore } from 'redux-persist'

let myTransform = createTransform(
  // transform state coming from redux on its way to being serialized and stored
  (inboundState, key) => specialSerialize(inboundState, key),
  // transform state coming from storage, on its way to be rehydrated into redux
  (outboundState, key) => specialDeserialize(outboundState, key),
  // configuration options
  {whitelist: ['specialReducer']}
)

persistStore(store, {transforms: [myTransform]})
```

## Migrations
One challenge developers encounter when persisting state for the first time is what happens when the shape of the application state changes between deployments? Solution: [redux-persist-migrate](https://github.com/wildlifela/redux-persist-migrate)

## Action Buffer
A common mistake is to fire actions that modify state before rehydration is complete which then will be overwritten by the rehydrate action. You can either defer firing of those actions until rehydration is complete, or you can use an [action buffer](https://github.com/rt2zz/redux-action-buffer/blob/master/README.md#redux-persist-example).

## Why Redux Persist

* Performant out of the box (uses a time iterator and operates on state partials)
* Keeps custom rehydration logic in the reducers (where it intuitively belongs)
* Supports localStorage, react-native AsyncStorage, or any conforming storage api

Because persisting state is inherently stateful, `persistStore` lives outside of the redux store. Importantly this keeps the store 'pure' and makes testing and extending the persistor much easier.

## About Auto Rehydrate
autoRehydrate is a store enhancer that automatically rehydrates state.

While auto rehydration works out of the box, individual reducers can opt in to handling their own rehydration, allowing for more complex operations like data transforms and cache invalidation. Simply define a handler for the rehydrate action in your reducer, and if the state is mutated, auto rehydrate will skip that key.

Auto rehydrate is provided as a convenience. In a large application, or one with atypical reducer composition, auto rehydration may not be convenient. In this case, simply omit autoRehydrate. Rehydration actions will still be fired by `persistStore`, and can then be handled individually by reducers or using a custom rehydration handler.
