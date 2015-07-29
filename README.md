# Redux Persist
Persist and rehydrate a redux store.

This module is an early experiment. Feedback welcome.

Implementing rehydration is very application specific. Check out some [recipes](https://github.com/rt2zz/redux-persist/blob/master/docs/recipes.md).

**v0.2.3** Try out the new autoRehydrate higher order reducer

##Basic Usage
```js
import { persistStore, autoRehydrate } from 'redux-persist'

const reducer = autoRehydrate(combineReducers(reducers))
const store = createStoreWithMiddleware(reducer)

persistStore(store, {}, () => {
  console.log('restored')
})

/**
persist store will immediately begin reading from disk and dispatching
rehydrate actions for each key in the store. autoRehydrate will handle
these actions automatically. If you need a custom handler add it in your
reducer roughly as follows:
**/

case REHYDRATE:
  if(action.key === 'myReducer'){

    //remove transient state
    delete action.data.someTransientKey

    //expire old data
    if(action.data.someCache.date < Date.getTime() - 1000*60*60){
      delete action.data.someCache
    }

    //update something
    action.data.initializationTime = Date.getTime()

    return {...state, ...action.data}
  }
  return state
```

##API
- `persistStore(store, [config, callback])`
  - **store** *redux store* The store to be persisted.
  - **config** *object*
    - **blacklist** *array* keys (read: reducers) to ignore
    - **actionCreator** *action creator* The rehydrate action creator. absent will use a default action creator which returns: `{ reducer, data, type: 'REHYDRATE}`
    - **storage** *object* An object with the following methods implemented `setItem(key, string, cb)` `getItem(key, cb)` `removeItem(key, cb)`
  - **callback** *function* Will be called after rehydration is finished.

  - `.purge(keys)`
    - **keys** *array* An array of keys to be purged from local storage.

  - `.purgeAll()`
    -  Purges all keys.

- `autoRehydrate(reducer)`
  - This is a higher order reducer that will automatically shallow merge the persisted state for each key.

##React-Native
```js
var { AsyncStorage } = require('react-native')
var { persistStore } = require('redux-persist')

persistStore(store, {storage: AsyncStorage}, () => {
  console.log('restored')
})
```

##Auto Rehydrate
Auto rehydrate is a higher order reducer that automatically rehydrates state. If you have a reducer that needs to handle its own hydration, perhaps with special time expiration rules, simply add a rehydration handler in your reducer, and autoRehydrate will ignore that reducer's keyspace.

Generally speaking if you have transient state that you do not want to rehydrate, you should put that in a separate reducer which you can blacklist.

**NOTE**: autoRehydrate does not currently support custom actionCreators

#### Why might this be a terrible idea?
- Not well tested
- Short circuits the normal reducer for 'REHYDRATE' actions
- Does not use ActionType Constant
- Does not support custom ActionCreators
- May not play well with other extensions like devtools

##Implementation Notes
For performance  
**During Rehydration** getItem calls are invoked once per key using setImmediate.  
**During Storage** setItem calls are invoked only on keys whose state has changed, using a time iterator one key every 33 ms (i.e. 30fps)  
