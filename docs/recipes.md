# Redux Persist Recipes

### Simplest Usage
```js
import { createStore, combineReducers } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
import * as reducers from '../reducers'

const reducer = autoRehydrate(combineReducers(reducers))
const store = createStore(reducer)

persistStore(store)
```
Data will be read out of localStorage and dispatched (asynchronously).
The reducer will take these actions and reyhdrate the state by merging it into the state of each reducer keyspace.

### Delay Render Until Rehydration Complete
```js
import { createStore, combineReducers } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
import * as reducers from '../reducers'

const reducer = autoRehydrate(combineReducers(reducers))
const store = createStore(reducer)

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

const reducer = autoRehydrate(combineReducers(reducers))
const store = createStore(reducer, {blacklist: ['someTransientReducer']}, () => {
  store.dispatch({ type: 'INITIALIZED' })
})

// ## someReducer.js
const initialState = {
  initialized: false,
  rehydrationCounter: null,
}

export default function someReducer(state = initialState, action) {
  switch (action.type) {

  case 'INITIALIZED':
    return {...state, initialized: true}

  case 'REHYDRATE':
    if(action.key === 'app'){
      delete action.payload.initialized
      rehydrationCounter = action.payload.rehydrationCounter || 0
      rehydrationCounter++
      return {...state, ...action.payload, rehyrationCounter}
    }
    return state

  default:
    return state
  }
}
```
Because we handle the rehydration in `someReducer` autoRehydrate will skip that rehydration. If you want to custom handle all of your rehydration, simply do not use the autoRehydrate reducer.

##React-Native
simply plug in AsyncStorage:
```js
var { AsyncStorage } = require('react-native')
import { createStore, combineReducers } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
import * as reducers from '../reducers'

const reducer = autoRehydrate(combineReducers(reducers))
const store = createStore(reducer)

persistStore(store, {storage: AsyncStorage}, () => {
  console.log('restored')
})
```
