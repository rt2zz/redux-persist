# Redux Persist Store
Persist and rehydrate a redux store (to localStorage)

This module is an early experiment. Feedback welcome.

##Basic Usage
```js
import persistStore from 'redux-persist-store'
import * as AppActions from '../actions/AppActions'
persistStore(store, {}, AppActions.rehydrate)

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
- `persistStore(store, [rules, rehydrateAction, callback])`
  - **store** *redux store* The store to be persisted.
  - **rules** *object* A object with rules about how persistStore should handle each keyspace of the app state. For example `rules = { user: false }` will result in the state.user being ignored. Right now each rule is a boolean, but in the future it will support rules as functions: `(state) => return {AccountID: state.AccountID}`
  - **rehydrateAction** *action creator* The rehydrate action creator. absent will use a default action creator which returns: `{ key, data, type: 'REHYDRATE}`
  - **callback** *function* Will be called after rehydration is finished.

- `persistStore.purge(keys)`
  - **keys** *array* An array of keys to be purged from local storage.

- `persistStore.purgeAll()`
  -  Purges all keys.
