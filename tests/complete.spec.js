// @flow

import test from 'ava'
import sinon from 'sinon'

import _ from 'lodash'
import configureStore from 'redux-mock-store'
import { combineReducers, createStore } from 'redux'

import persistReducer from '../src/persistReducer'
import persistStore from '../src/persistStore'
import { createMemoryStorage } from 'storage-memory'
import { PERSIST, REHYDRATE } from '../src/constants'
import sleep from './utils/sleep'

let reducer = () => ({})
const config = {
  key: 'persist-reducer-test',
  version: 1,
  storage: createMemoryStorage(),
  debug: true,
}

test('multiple persistReducers work together', t => {
  return new Promise((resolve, reject) => {
    let r1 = persistReducer(config, reducer)
    let r2 = persistReducer(config, reducer)
    const rootReducer = combineReducers({ r1, r2 })
    const store = createStore(rootReducer)
    const persistor = persistStore(store, {}, () => {
      console.log(store.getState(), persistor.getState()) 
      t.is(persistor.getState().bootstrapped, true)
      resolve()      
    })
  })
})

test('multiple persistReducers work together, and continue to persist through multiple actions', t => {
  const INCREMENT = 'INCREMENT'
  let storage = createMemoryStorage()
  let reducer = (state = { counter: 0 }, action) => ({
    counter: action.type === INCREMENT ? state.counter + 1 : state.counter
  })
  const config1 = {
    key: 'persist-reducer-1',
    version: 1,
    storage,
    debug: true,
  }
  const config2 = {
    ...config1,
    key: 'persist-reducer-2'
  }
  return new Promise((resolve, reject) => {
    let r1 = persistReducer(config1, reducer)
    let r2 = persistReducer(config2, reducer)
    const rootReducer = combineReducers({ r1, r2 })
    const store = createStore(rootReducer)
    const persistor = persistStore(store, {}, async () => {
      t.is(persistor.getState().bootstrapped, true)
      store.dispatch({ type: INCREMENT })
      await sleep(10)
      let keys = await storage.getAllKeys()
      let firstKey = keys[0] || '1'
      let state1 = await storage.getItem(firstKey)
      store.dispatch({ type: INCREMENT })
      await sleep(10)
      let state2 = await storage.getItem(firstKey)
      store.dispatch({ type: INCREMENT })
      await sleep(10)
      let state3 = await storage.getItem(firstKey)
      let state3Object = JSON.parse(state3)
      t.is(state3Object.counter, '3')
      resolve()
    })
  })
})
