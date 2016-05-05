# Redux Persist
Persist and rehydrate a redux store.

Redux Persist is [performant](#why-redux-persist), easy to [implement](#basic-usage), and easy to [extend](#transforms).

**[V3 changelog](https://github.com/rt2zz/redux-persist/releases/tag/v3.0.0)**
These docs are for redux-persist v3. This version removes the automatic action buffer, if you relied on this functionality you can now [implement it explicitly](#action-buffer).

**[Migrations](https://github.com/wildlifela/redux-persist-migrate)**
are hot off the presses, feedback welcome!

`npm i --save redux-persist`

[![build status](https://img.shields.io/travis/rt2zz/redux-persist/master.svg?style=flat-square)](https://travis-ci.org/rt2zz/redux-persist)
[![npm version](https://img.shields.io/npm/v/redux-persist.svg?style=flat-square)](https://www.npmjs.com/package/redux-persist)
[![npm downloads](https://img.shields.io/npm/dm/redux-persist.svg?style=flat-square)](https://www.npmjs.com/package/redux-persist)

## Basic Usage
Basic usage requires adding three lines to a traditional redux application:
```js
import {persistStore, autoRehydrate} from 'redux-persist'
const store = createStore(reducer, undefined, autoRehydrate())
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
persistStore(store, config, callback).purge(['someReducer']) //or .purgeAll()
```

## API
#### `persistStore(store, [config, callback])`
  - arguments
    - **store** *redux store* The store to be persisted.
    - **config** *object*
      - **blacklist** *array* keys (read: reducers) to ignore
      - **whitelist** *array* keys (read: reducers) to persist, if set all other keys will be ignored.
      - **storage** *object* a [conforming](https://github.com/rt2zz/redux-persist#storage-backends) storage engine.
      - **transforms** *array* transforms to be applied during storage and during rehydration.
      - **debounce** *integer* debounce interval applied to storage calls.
    - **callback** *function* will be called after rehydration is finished.
  - returns **persistor** object

#### `persistor object`
  - the persistor object is returned by persistStore with the following methods:
    - `.purge(keys)`
      - **keys** *array* An array of keys to be purged from local storage. (this method is available on the return value of persistStore)
    - `.purgeAll()`
      - Purges all keys. (this method is available on the return value of persistStore)

#### `autoRehydrate()`
  - This is a store enhancer that will automatically shallow merge the persisted state for each key. Additionally it queues any actions that are dispatched before rehydration is complete, and fires them after rehydration is finished.

#### `constants`
  - `import constants from 'redux-persist/constants'`. This includes rehydration action types, and other relevant constants.

## Alternate Usage
#### getStoredState / createPersistor
```js
import {getStoredState, autoRehydrate, createPersistor} from 'redux-persist'

// ...

const persistConfig = { /* ... */ }

getStoredState(persistConfig, (err, restoredState) => {
  const store = createStore(reducer, restoredState)
  const persistor = createPersistor(store, persistConfig)
})
```
**Notes:**  
* under the hood, `persistStore` simply implements both `getStoredState` and `createPersistor`
* getStoredState supports promises as well

#### Secondary Persistor
```js
import {persistStore, createPersistor} from 'redux-persist'
const persistor = persistStore(store) // persistStore restores and persists
const secondaryPersistor = createPersistor(store, {storage: specialBackupStorage}) // createPersistor only persists
```

## Storage Backends
- **localStorage** (default) web
- **[localForage](https://github.com/mozilla/localForage)** (recommended) web, see usage below
- **[AsyncStorage](http://facebook.github.io/react-native/docs/asyncstorage.html#content)** for react-native
- **custom** any conforming storage api implementing the following methods: `setItem` `getItem` `removeItem` `getAllKeys`. [[example](https://github.com/facebook/react-native/blob/master/Libraries/Storage/AsyncStorage.js)]

```js
// react-native
import {AsyncStorage} from 'react-native'
persistStore(store, {storage: AsyncStorage})

// web with recommended localForage
import localForage from 'localForage'
persistStore(store, {storage: localForage})
```

## Transforms
Transforms allow for arbitrary state trasnforms before saving and during rehydration.
- [immutable](https://github.com/rt2zz/redux-persist-transform-immutable) - support immutable reducers
- [compress](https://github.com/rt2zz/redux-persist-transform-compress) - compress your serialized state with lz-string
- custom transforms:
```js
import { createTransform, persistStore } from 'redux-persist'

let myTransform = createTransform(
  (inboundState) => specialSerialize(inboundState),
  (outboundState) => specialDeserialize(outboundState),
  {whitelist: ['specialReducer']}
)

persistStore(store, {transforms: [myTransform]})
```

## Action Buffer
A common mistake is to fire actions that modify state before rehydration is complete which then will be overwritten by the rehydrate action. You can either defer firing of those actions until rehydration is complete, or you can use an [action buffer](https://github.com/rt2zz/redux-action-buffer/blob/master/README.md#redux-persist-example).

Earlier versions of redux persist included the action buffer by default, but it was removed in v3.


## Why Redux Persist

* Performant out of the box (uses a time iterator and operates on state partials)
* Keeps custom rehydration logic in the reducers (where it intuitively belongs)
* Supports localStorage, react-native AsyncStorage, or any conforming storage api

Because persisting state is inherently stateful, `persistStore` lives outside of the redux store. Importantly this keeps the store 'pure' and makes testing and extending the persistor much easier.

## About Auto Rehydrate
autoRehydrate is a store enhancer that automatically rehydrates state.

While auto rehydration works out of the box, individual reducers can opt in to handling their own rehydration, allowing for more complex operations like data transforms and cache invalidation. Simply define a handler for the rehydrate action in your reducer, and if the state is mutated, auto rehydrate will skip that key.

Auto rehydrate is provided as a convenience. In a large application, or one with atypical reducer composition, auto rehydration may not be convenient. In this case, simply omit autoRehydrate. Rehydration actions will still be fired by `persistStore`, and can then be handled individually by reducers or using a custom rehydration handler.
