import { combineReducers, createStore } from 'redux'

import persistReducer from '../src/persistReducer'
import persistStore from '../src/persistStore'
import createMemoryStorage from './utils/createMemoryStorage'
import brokenStorage from './utils/brokenStorage'

const reducer = () => ({})
const config = {
  key: 'persist-reducer-test',
  version: 1,
  storage: createMemoryStorage(),
  debug: true,
  timeout: 5,
}

test('multiple persistReducers work together', async () => {
  return new Promise<void>((resolve) => {
    const r1 = persistReducer(config, reducer)
    const r2 = persistReducer(config, reducer)
    const rootReducer = combineReducers({ r1, r2 })
    const store = createStore(rootReducer)
    const persistor = persistStore(store, {}, () => {
      expect(persistor.getState().bootstrapped).toBe(true)
      resolve()
    })
  })
})

test('persistStore timeout 0 never bootstraps', async () => {
  return new Promise<void>((resolve, reject) => {
    const r1 = persistReducer({...config, storage: brokenStorage, timeout: 0}, reducer)
    const rootReducer = combineReducers({ r1 })
    const store = createStore(rootReducer)
    const persistor = persistStore(store, undefined, () => {
      console.log('resolve')
      reject()
    })
    setTimeout(() => {
      expect(persistor.getState().bootstrapped).toBe(false)
      resolve()
    }, 10)
  })
})


test('persistStore timeout forces bootstrap', async () => {
  return new Promise<void>((resolve, reject) => {
    const r1 = persistReducer({...config, storage: brokenStorage}, reducer)
    const rootReducer = combineReducers({ r1 })
    const store = createStore(rootReducer)
    const persistor = persistStore(store, undefined, () => {
      expect(persistor.getState().bootstrapped).toBe(true)
      resolve()
    })
    setTimeout(() => {
      reject()
    }, 10)
  })
})
