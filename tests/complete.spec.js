// @flow

import test from 'ava'
import sinon from 'sinon'

import _ from 'lodash'
import configureStore from 'redux-mock-store'
import { combineReducers, createStore } from 'redux'

import persistReducer from '../src/persistReducer'
import persistStore from '../src/persistStore'
import createWebStorage from '../src/storage/createWebStorage'
import { PERSIST, REHYDRATE } from '../src/constants'
import sleep from './utils/sleep'

let reducer = () => ({})
const config = {
  key: 'persist-reducer-test',
  version: 1,
  storage: createWebStorage('local'),
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
