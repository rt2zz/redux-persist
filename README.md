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
