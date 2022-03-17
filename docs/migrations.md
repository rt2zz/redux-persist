
Redux Persist takes all functions from `migrations` above the inbound persisted store version and runs them in ascending order (by version key) to return the final state

It's mean every time you update your state schema and want to support users with persisted data -- you have to create migration and increase a `version` in [config object](https://github.com/rt2zz/redux-persist/blob/master/types/types.d.ts#L27)

## Redux Persist Migration Example

### Example with createMigrate
```js
import { createMigrate, persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/es/storage'

const migrations = {
  0: (state) => {
    // migration clear out device state
    return {
      ...state,
      device: undefined   
    }
  },
  1: (state) => {
    // migration to keep only device state
    return {
      device: state.device
    }
  }
}

const persistConfig = {
  key: 'primary',
  version: 1,
  storage,
  migrate: createMigrate(migrations, { debug: false }),
}

const finalReducer = persistReducer(persistConfig, reducer)

export default function configureStore() {
  let store = createStore(finalReducer)
  let persistor = persistStore(store)
  return { store, persistor }
}
```

### Alternative
The migrate method can be any function with which returns a promise of new state. 
```js
const persistConfig = {
  key: 'primary',
  version: 1,
  storage,
  migrate: (state) => {
    console.log('Migration Running!')
    return Promise.resolve(state)
  }
}
