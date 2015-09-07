# Redux Persist Recipes

### Simplest Usage
```js
import { createStore, combineReducers } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
import reducer from '../reducers'

const store = compose(autoRehydrate())(createStore)(reducer)
persistStore(store)
```
Stored state will be read out of localStorage and dispatched (asynchronously), autoRehydrate will use these actions to merge the stored state into the initial state.

### Delay Render Until Rehydration Complete
```js
import { createStore, combineReducers } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
import reducer from '../reducers'

const store = compose(autoRehydrate())(createStore)(reducer)

export default class AppProvider extends Component {

  componentWillMount(){
    persistStore(store, {}, () => {
      this.setState({ rehydrated: true })
    })
  }

  render() {
    if(!this.state.rehydrated){
      return <div>Loading...</div>
    }
    return (
      <Provider store={store}>
        {() => <App />}
      </Provider>
    )
  }
}
```

### Blacklist & Custom Rehydration
```js
// ## app.js
import { createStore, combineReducers } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
import * as reducers from '../reducers'

const store = compose(autoRehydrate())(createStore)(reducer)
persistStore(store, {blacklist: ['aTransientReducer']})

// ## someReducer.js
import { REHYDRATE, REHYDRATE_COMPLETE } from 'redux-persist/constants'

const initialState = {
  rehydrationCount: 0,
  initialized: false,
}

export default function someReducer(state = initialState, action) {
  switch (action.type) {

  case REHYDRATE_COMPLETE:
    return {...state, initialized: true}

  case REHYDRATE:
    // *important* to make sure the rehydration key matches the reducer key.
    if(action.key === 'someReducer'){

      //delete transient data
      delete action.payload.someTransientData

      //increment a counter
      var rehydrationCount = action.payload.rehydrationCount + 1

      //invalidate a cache
      var someCachedData = Date.now()-10000 > action.payload.someCachedData.time ? null : action.payload.someCachedData

      return {...state, rehydrationCount, someCachedData}
    }
    return state

  default:
    return state
  }
}
```

##React-Native
simply plug in AsyncStorage:
```js
var { AsyncStorage } = require('react-native')
import { createStore, combineReducers } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
import reducer from '../reducers'

const store = compose(autoRehydrate())(createStore)(reducer)

persistStore(store, {storage: AsyncStorage}, () => {
  console.log('restored')
})
```

##Custom Action Creator
Custom action creators are one way to take action during rehydration, such as validating access tokens.
```js
import { REHYDRATE } from 'redux-persist/constants'

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
