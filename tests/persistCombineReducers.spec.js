// @flow

import persistCombineReducers from '../src/persistCombineReducers'
import createWebStorage from '../src/storage/createWebStorage'

import test from 'ava'

const config = {
  key: 'TestConfig',
  storage: createWebStorage('local')
}

test('persistCombineReducers returns a function', t => {
  let reducer = persistCombineReducers(config, {
    foo: () => ({})
  })

  t.is(typeof reducer, 'function')
})

test.skip('persistCombineReducers merges two levels deep of state', t => {
  
})