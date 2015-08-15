# Redux Persist
Persist a redux store.

* Operates on a per reducer basis
* Performant out of the box (uses a time iterator and operates on state partials)
* Supports localStorage, react-native AsyncStorage, or any conforming storage api

**NOTE** a lot of changes in 0.4.0. Please submit an issue if you have any trouble migrating.

Implementing rehydration is very application specific. Check out some [recipes](https://github.com/rt2zz/redux-persist/blob/master/docs/recipes.md).

## Basic Usage
Basic usage requires adding three lines to a traditional redux application:
```js
import { persistStore, autoRehydrate } from 'redux-persist'
const store = compose(autoRehydrate(), createStore)(reducer)
persistStore(store)
```
For more complex rehydration, like restoring immutable data, add a handler to your reducer:
```js
import {REHYDRATE} from 'redux-persist/constants'
//...
case REHYDRATE:
  if(action.key === 'myReducer'){
    //restore immutable data
    let someList = Immutable.List(action.payload.someList)
    return {...state, ...action.payload, someList}
  }
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

## Rationale
The core idea behind redux-persist is to provide performant persistence and rehydration methods. Additionally redux-persist is designed to minimize complexity by knowing as little as possible about your application and state schema. All of this is achieved through the `persistStore` method with no additional configuration.

However because persistence is such a common problem, and because applications tend to have similar but slightly different persistence rules, redux-persist also provides several convenience methods (e.g. `autoRehydrate`) and configuration options (e.g. `config.transforms`). Do not let these scare you away, they are really just "shortcuts" for achieving various functionality.

Conceptually redux-persist encourages you to think on a per-reducer basis. This greatly simplifies the mental model (no filters or selectors!) and means that if you change your reducer schema, you will not need to mirror those changes in your persistence configuration. If you have some transient state that should not be persisted, it is probably best to split that state into it's own reducer which can then be added to the persistStore blacklist.

## API
- `persistStore(store, [config, callback])`
  - **store** *redux store* The store to be persisted.
  - **config** *object*
    - **blacklist** *array* keys (read: reducers) to ignore
    - **actionCreator** *action creator* The rehydrate action creator. absent will use a default action creator which returns: `{ key, payload, type: 'REHYDRATE'}`
    - **storage** *object* An object with the following methods implemented `setItem(key, string, cb)` `getItem(key, cb)` `removeItem(key, cb)`
    - **transforms** *array* transforms to be applied during storage and during rehydration.
  - **callback** *function* Will be called after rehydration is finished.

- `autoRehydrate`
  - This is a store enhancer that will automatically shallow merge the persisted state for each key. Additionally it queues any actions that are dispatched before rehydration is complete, and fires them after rehydration is finished.

- `.purge(keys)`
  - **keys** *array* An array of keys to be purged from local storage. (this method is available on the return value of persistStore)

- `.purgeAll()`
  -  Purges all keys. (this method is available on the return value of persistStore)

- `constants`
  - `import constants from 'redux-persist/constants'`. This includes rehydration action types, and other relevant constants.

## Customization
#### Immutable Support
The `redux-persist-immutable` transform will serialize immutable objects using [transit-immutable-js](https://github.com/glenjamin/transit-immutable-js) and automatically restore them.
```js
import reduxPersistImmutable from 'redux-persist-immutable'
persistStore(store, {transforms: [reduxPersistImmutable]})

// It works on nested and mixed immutable objects as well:
state = {
  reducerA: Map(),
  reducerB: {a: 1, b: Map()},
  reducerC: {a: Map({aa: 'foo', bb: List([1, 2])})}
}
```

#### Custom Action Creator
Custom action creators are one way to take action during rehydration, such as validating access tokens.
```js
import { REHYDRATE } from 'redux-persist/constants' // be sure to use the provided action type constants if using autoRehydrate
const rehydrateAction = (key, data) => {
  if(key === 'auth'){
    validateToken(data.token)
  }
  return {
    type: REHYDRATE,
    key: key,
    payload: data
  }
}
persistStore(store, {actionCreator: rehydrateAction})
```
#### Without Auto Rehydration
The heavy lifting in redux-persist is in restoration. `autoRehydrate` is purely provided as a convenience. In a large application, or one with atypical reducer composition, auto rehydration may not be convenient. In this case, simply omit autoRehydrate. Rehydration actions will still be fired by `persistStore`, and you can then either write a custom rehydration function, or handle your rehydration on a reducer by reducer basis.

## Storage Backends
**localStorage** (default), react-native **AsyncStorage**, or a conforming **custom** storage api. Custom storage API should be an object with the following methods: `setItem` `getItem` `removeItem` `getAllKeys` each with the function signature as found in [react-native AsyncStorage](http://facebook.github.io/react-native/docs/asyncstorage.html#content).


#### React-Native Example
```js
var { AsyncStorage } = require('react-native')
var { persistStore } = require('redux-persist')

persistStore(store, {storage: AsyncStorage}, () => {
  console.log('rehydration complete')
})
```

## Auto Rehydrate Notes
Auto rehydrate is a higher order reducer that automatically rehydrates state.

While auto rehydration works out of the box, individual reducers can opt in to handling their own rehydration, allowing for more complex operations like applying data transforms, or doing cache invalidation. Simply define a handler for the rehydrate action in your reducer, and if the state is mutated, auto rehydrate will skip that key.

autoRehydrate will automatically queue any actions dispatched before rehydration is complete, and fire them immediately after rehydration is complete. This is to avoid the tricky problem of rehydration over-writing earlier state changes.

```js
case REHYDRATE:
  //make sure to check the key that is currently being rehydrated!
  if(action.key === 'myReducer'){
    //delete transient data
    delete action.payload.someTransientData

    //increment a counter
    var rehydrationCount = action.payload.rehydrationCount + 1

    //invalidate a cache
    var someCachedData = Date.now()-10000 > action.payload.someCachedData.time ? null : action.payload.someCachedData

    return {...state, rehydrationCount, someCachedData}
  }
  else return state

```

## Implementation Notes
For performance  
**During Rehydration** getItem calls are invoked once per key using setImmediate.  
**During Storage** setItem calls are invoked only on keys whose state has changed, using a time iterator one key every 33 ms (i.e. 30fps)  
