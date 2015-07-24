# Redux Persist Store
Persist and rehydrate a redux store (to localStorage)

This module is an early experiment. Feedback welcome.

**v0.2.0** the API has changed! see below:

##Basic Usage
```js
import persistStore from 'redux-persist-store'
import * as AppActions from '../actions/AppActions'
persistStore(store, {blacklist: ['someReducer'], actionCreator: AppActions.rehydrate}, () => {
  console.log('restored')
})

/**
persist store will immediately begin reading from localStorage and dispatching
rehydrate actions for each key in the store.
**/

//... elsewhere in your reducer
export default function myReducer(state, action) {
  switch (action.type) {
  case REHYDRATE:
    if(action.reducer === 'myReducer') return {...state, ...action.data}
    return state
  default:
    return state
  }
}
```

##API
- `persistStore(store, [config, callback])`
  - **config** *object*
    - **store** *redux store* The store to be persisted.
    - **blacklist** *array* keys (read: reducers) to ignore
    - **actionCreator** *action creator* The rehydrate action creator. absent will use a default action creator which returns: `{ key, data, type: 'REHYDRATE}`
    - **storage** *object* An object with the following methods implemented `setItem(key, string, cb)` `getItem(key, cb)` `removeItem(key, cb)`
  - **callback** *function* Will be called after rehydration is finished.

- `persistStore.purge(keys)`
  - **keys** *array* An array of keys to be purged from local storage.

- `persistStore.purgeAll()`
  -  Purges all keys.

##React-Native
```js
var { AsyncStorage } = require('react-native')
var persistStore = require('redux-persist-store')

persistStore(store, {storage: AsyncStorage}, () => {
  console.log('restored')
})
```

##Implementation Notes
For performance
**During Rehydration** getItem calls are invoked once per store key using setImmediate.
**During Storage** setItem calls are invoked only on keys whose state has changed, using a time iterator one key every 33 ms (i.e. 30fps)
