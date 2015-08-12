# Redux Persist
Persist a redux store.

* Operates on a per reducer basis
* Performant out of the box (uses a time iterator and operates on state partials)
* Supports localStorage, react-native AsyncStorage, or any conforming storage api

**NOTE** a lot of changes in 0.3.0. Please submit an issue if you have any trouble migrating.

Implementing rehydration is very application specific. Check out some [recipes](https://github.com/rt2zz/redux-persist/blob/master/docs/recipes.md).

## Basic Usage
Basic usage requires adding three lines to a traditional redux application:
```js
import { persistStore, autoRehydrate } from 'redux-persist'
const reducer = autoRehydrate(combineReducers(reducers))
const store = createStore(reducer)
persistStore(store)
```
For more complex rehydration, like restoring immutable data, add a handler to your reducer:
```js
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
  store.dispatch({type: 'REHYDRATION_COMPLETE'})
})
```

## Rationale
The core idea behind redux-persist is to provide performant persistence rehydration methods. Additionally redux-persist is designed to minimize complexity by knowing as little as possible about your application and state schema. All of this is achieved through the `persistStore` method with no additional configuration.

However because persistence is such a common problem, and because applications tend to have similar but slightly different persistence rules, redux-persist also provides several convenience methods and configuration options. Do not let these scare you away, they are really just "shortcuts" for achieving various functionality.

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

- `autoRehydrate(reducer)`
  - This is a higher order reducer that will automatically shallow merge the persisted state for each key.

- `.purge(keys)`
  - **keys** *array* An array of keys to be purged from local storage. (this method is available on the return value of persistStore)

- `.purgeAll()`
  -  Purges all keys. (this method is available on the return value of persistStore)

## Customization
#### Automatic (shallow) Immutable Support
This transform will mark all immutablejs data keys during storage and restore them using `Immutable.fromJS` during rehydration. While it will successfully serialize any Iterable, it can only restore to Maps and Lists for now (see [immutablejs#336](https://github.com/facebook/immutable-js/issues/336)). As the name suggests this only works shallowly across each keyspace, see comments below. If you need more fine tuned control you should use rehydration handlers.
```js
import immutableShallow from 'redux-persist/transforms/immutableShallow'
persistStore(store, {transforms: [immutableShallow]})
```
This only works shallowly! See following:
```js
// state before storage
state = {
  reducerA: Map(),
  reducerB: {a: 1, b: Map()},
  reducerC: {a: {aa: Map()}}
  reducerD: {a: Map({aa: List([1, 2])})}
}
// state after restore (with immutableShallow transform)
state = {
  reducerA: Map(), //perfect
  reducerB: {a: 1, b: Map()}, //perfect
  reducerC: {a: {aa: {}}} //Lost Nested Map
  reducerD: {a: Map({aa: [1, 2]})} //Lost Nested List (but preserved top level Map)
}
```

#### Custom Action Creator
Custom action creators are one way to take action during rehydration, such as validating access tokens.
```js
const rehydrateAction = (key, data) => {
  if(key === 'auth'){
    validateToken(data.token)
  }
  return {
    type: 'REHYDRATE',
    meta: { reduxPersistRehydration: true }, // set true if using autoRehydrate
    key: key,
    payload: data
  }
}
persistStore(store, {actionCreator: rehydrateAction})
```
#### Without Auto Rehydration
The heavy lifting in redux-persist is in restoration. autoRehydrate is purely provided as a convenience. In a larger or application, or one with atypical reducer composition, auto rehydration may not be convenient - simply do not wrap your reducer. You can then either write a custom rehydration function, or handle your rehydration on a reducer by reducer basis.

## Storage Backends
**localStorage** (default), react-native **AsyncStorage**, or a conforming **custom** storage api. Custom storage API should be an object with the following methods: `setItem` `getItem` `removeItem` `getAllKeys` each with the function signature as found in [react-native AsyncStorage](http://facebook.github.io/react-native/docs/asyncstorage.html#content).


#### React-Native Example
```js
var { AsyncStorage } = require('react-native')
var { persistStore } = require('redux-persist')

persistStore(store, {storage: AsyncStorage}, () => {
  console.log('restored')
})
```

## Motivations & Explanations
Conceptually redux-persist operates on a per reducer basis. This enables the persistance layer to know as little about the application as possible. This is important, reducers should be the single source of truth for your state manipulation.

It also enables great out of the box performance, as each save only operates on chunks of state, rather than the entire state object.

While auto rehydration works out of the box, individual reducers can opt in to handling their own rehydration, allowing for more complex operations like applying data transforms, or doing cache invalidation. Simply define a handler for the rehydrate action in your reducer, and if the state is mutated, auto rehydrate will skip that key.

## Auto Rehydrate
Auto rehydrate is a higher order reducer that automatically rehydrates state. If you have a reducer that needs to handle its own hydration, perhaps with special time expiration rules, simply add a rehydration handler in your reducer, and autoRehydrate will ignore that reducer's keyspace.

Generally speaking if you have transient state that you do not want to rehydrate, you should put that in a separate reducer which you can blacklist.

**NOTE**: autoRehydrate does not currently support custom actionCreators

## Implementation Notes
For performance  
**During Rehydration** getItem calls are invoked once per key using setImmediate.  
**During Storage** setItem calls are invoked only on keys whose state has changed, using a time iterator one key every 33 ms (i.e. 30fps)  
