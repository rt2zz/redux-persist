# Redux Persist Recipes

### Simplest Usage
```js
import { createStore, compose } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
import reducer from '../reducers'

const store = compose(autoRehydrate())(createStore)(reducer)
persistStore(store)
```
Stored state will be read out of localStorage and dispatched (asynchronously), autoRehydrate will use these actions to merge the stored state into the initial state.

### Delay Render Until Rehydration Complete
```js
import { createStore, compose } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
import reducer from '../reducers'

const store = compose(autoRehydrate())(createStore)(reducer)

export default class AppProvider extends Component {

  constructor() {
    super()
    this.state = { rehydrated: false }
  }

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

## React-Native
simply plug in AsyncStorage:
```js
import { AsyncStorage } from 'react-native'
import { createStore, compose } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
import reducer from '../reducers'

const store = compose(autoRehydrate())(createStore)(reducer)

persistStore(store, {storage: AsyncStorage}, () => {
  console.log('restored')
})
```
