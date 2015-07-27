# Redux Persist
Persist and rehydrate a redux store.

This module is an early experiment. Feedback welcome.

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
persist store will immediately begin reading from localStorage and dispatching
rehydrate actions for each key in the store.
**/

//... elsewhere in your reducer
export default function myReducer(state, action) {
  switch (action.type) {
  case REHYDRATE:
    if(action.key === 'myReducer') return {...state, ...action.data}
    return state
  default:
    return state
  }
}
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

##React-Native
```js
var { AsyncStorage } = require('react-native')
var persistStore = require('redux-persist-store')

persistStore(store, {storage: AsyncStorage}, () => {
  console.log('restored')
})
```

##Auto Rehydrate
The basic usage works well, but requires a fair amount of boilerplate, and can be error prone. Enter experimentalAutoRehydrate:
```js
import { createStore, applyMiddleware, combineReducers } from 'redux'
import persistStore, { experimentalAutoRehydrate } from 'redux-persist-store'

import * as reducers from '../reducers'

const reducer = experimentalAutoRehydrate(combineReducers(reducers))
const store = createStore(reducer)

persistStore(store, {}, (err) => {
  console.log('State has been rehydrated to: ', store.getState())
  //@NOTE do not dispatch any actions before rehydrate completes as state will be overwritten.
})

```
Thats it, no need to create constants or mess with your individual reducers.

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
