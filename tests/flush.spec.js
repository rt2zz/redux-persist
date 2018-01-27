// @flow

import test from 'ava'
import sinon from 'sinon'

import _ from 'lodash'
import configureStore from 'redux-mock-store'
import { createStore } from 'redux'

import getStoredState from '../src/getStoredState'
import persistReducer from '../src/persistReducer'
import persistStore from '../src/persistStore'
import { createMemoryStorage } from 'storage-memory'
import { PERSIST, REHYDRATE } from '../src/constants'
import sleep from './utils/sleep'

const INCREMENT = 'INCREMENT'

const initialState = { a: 0, b: 10, c: 100}
let reducer = (state = initialState, { type }) => {
  console.log('action', type)
  if (type === INCREMENT) {
    return _.mapValues(state, v => v + 1)
  }
  return state
}

const memoryStorage = createMemoryStorage()

const config = {
  key: 'persist-reducer-test',
  version: 1,
  storage: memoryStorage,
  debug: true,
  throttle: 1000,
}

test('state before flush is not updated, after flush is', t => {
  return new Promise((resolve, reject) => {
    let rootReducer = persistReducer(config, reducer)
    const store = createStore(rootReducer)
    const persistor = persistStore(store, {}, async () => {
      store.dispatch({ type: INCREMENT })
      const state = store.getState()
      let storedPreFlush = await getStoredState(config)
      t.not(storedPreFlush && storedPreFlush.c, state.c)
      await persistor.flush()
      let storedPostFlush = await getStoredState(config)
      resolve(t.is(storedPostFlush && storedPostFlush.c, state.c))
    })
  })
})
