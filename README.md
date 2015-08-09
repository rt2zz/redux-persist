# Redux Persist
Persist a redux store.

* Operates on a per reducer basis
* Performant out of the box (uses a time interator and operates on state partials)
* Knows as little as possible about your application state and reducer internals
* Supports any storage backend including localStorage, react-native AsyncStorage, or any conforming api

**NOTE** 0.2.7 switched to flux standard actions. If you are using custom rehydration be sure to update `action.key => action.payload.key` and `action.data => action.payload.data`

Implementing rehydration is very application specific. Check out some [recipes](https://github.com/rt2zz/redux-persist/blob/master/docs/recipes.md).

##Basic Usage
Basic usage requires adding three lines to a traditional redux application:
```js
import { persistStore, autoRehydrate } from 'redux-persist'
const reducer = autoRehydrate(combineReducers(reducers))
const store = createStore(reducer)

persistStore(store)
```
For more complex rehydration, add a handler to your reducer:
```js
case REHYDRATE:
  if(action.key === 'myReducer'){

    //remove transient state
    delete action.data.someTransientKey

    //expire old data
    if(action.data.someCache.date < Date.getTime() - 1000*60*60){
      delete action.data.someCache
    }

    //immutable data
    let someIndex = Immutable.List(action.data.someIndex)

    return {...state, ...action.data, someIndex}
  }
  return state
```
You may need to configure the persistance layer, or take action after rehydration has completed:
```js
persistStore(store, {blacklist: ['someTransientReducer']}, () => {
  store.dispatch({type: 'REHYDRATION_COMPLETE'})
})
```

##API
- `persistStore(store, [config, callback])`
  - **store** *redux store* The store to be persisted.
  - **config** *object*
    - **blacklist** *array* keys (read: reducers) to ignore
    - **actionCreator** *action creator* The rehydrate action creator. absent will use a default action creator which returns: `{ reducer, data, type: 'REHYDRATE}`
    - **storage** *object* An object with the following methods implemented `setItem(key, string, cb)` `getItem(key, cb)` `removeItem(key, cb)`
  - **callback** *function* Will be called after rehydration is finished.

- `autoRehydrate(reducer)`
  - This is a higher order reducer that will automatically shallow merge the persisted state for each key.

- `.purge(keys)`
  - **keys** *array* An array of keys to be purged from local storage.

- `.purgeAll()`
  -  Purges all keys.

## Storage Backends
Use any storage backend including: **localStorage** (default), react-native **AsyncStorage**, or a conforming **custom** storage api.

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

##Implementation Notes
For performance  
**During Rehydration** getItem calls are invoked once per key using setImmediate.  
**During Storage** setItem calls are invoked only on keys whose state has changed, using a time iterator one key every 33 ms (i.e. 30fps)  
