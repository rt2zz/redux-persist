// @flow

import test from 'ava'
import sinon from 'sinon'

import _ from 'lodash'
import configureStore from 'redux-mock-store'
import { combineReducers, createStore } from 'redux'

import persistReducer from '../src/persistReducer'
import persistStore from '../src/persistStore'
import { createMemoryStorage } from 'storage-memory'
import brokenStorage from './utils/brokenStorage'
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
      t.is(persistor.getState().bootstrapped, true)
      resolve()      
    })
  })
})

test('persistStore undefined timeout never bootstraps with broken storage', t => {
  return new Promise((resolve, reject) => {
    let r1 = persistReducer({...config, storage: brokenStorage}, reducer)
    const rootReducer = combineReducers({ r1 })
    const store = createStore(rootReducer)
    const persistor = persistStore(store, { }, () => {
      reject()     
    })
    setTimeout(() => {
      t.is(persistor.getState().bootstrapped, false)
      resolve()
    }, 10)
  })
})


test('persistStore timeout forces bootstrap', t => {
  return new Promise((resolve, reject) => {
    let r1 = persistReducer({...config, storage: brokenStorage}, reducer)
    const rootReducer = combineReducers({ r1 })
    const store = createStore(rootReducer)
    const persistor = persistStore(store, { timeout: 1 }, () => {
      t.is(persistor.getState().bootstrapped, true)
      resolve()
    })
    setTimeout(() => {
      reject()
    }, 10)
  })
})
