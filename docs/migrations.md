# Redux Persist Migration Example

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

// Optional downgradeMigrations
const downgradeMigrations = {
  0: (state) => {
    // Since in version 1 the old state of version 0 was lost,
    // use the default values for the state
    const defaultState = getDefaultState()
    return {
      ...defaultState,
      device: state.device   
    }
  },
  -1: (state) => {
    // migration to intial state version, 
    // assuming the state structure didn't change between -1 and 0
    return {
      ...state
    }
  }
}

const persistConfig = {
  key: 'primary',
  version: 1,
  storage,
  migrate: createMigrate(migrations, { debug: false }, downgradeMigrations),
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
