/* global it, describe */

import { persistStore, getStoredState } from '../src'
import * as constants from '../src/constants'
import createMemoryStorage from './mock/createMemoryStorage'
import assert from 'assert'
import { isEqual } from 'lodash'

function createMockStore (opts) {
  return {
    subscribe: opts.subscribe || function () {},
    dispatch: opts.dispatch || function () {},
    getState: () => {
      return opts.mockState ? {...opts.mockState} : {}
    }
  }
}

describe('persistStore scenarios', function () {
  it('Returns state to persistStore callback', function (done) {
    let store = createMockStore({
      mockState: {foo: 1, bar: 2},
      dispatch: () => {}
    })

    let seedState = {foo: 3, bar: 4}
    persistStore(store, { storage: createMemoryStorage(seedState) }, (err, state) => {
      if (err) throw new Error()
      assert(isEqual(state, seedState))
      done()
    })
  })
})

describe('getStoredState', function () {
  it('returns stored state', function (done) {
    let seedState = {foo: 3, bar: 4}
    getStoredState({ storage: createMemoryStorage(seedState) }, (err, state) => {
      if (err) throw new Error()
      assert(isEqual(state, seedState))
      done()
    })
  })
})

describe('adhoc rehydrate', function () {
  it('processes adhoc rehydrate with serial: true', function (done) {
    let store = createMockStore({
      mockState: { foo: 3, bar: [1] },
      dispatch: (action) => {
        if (action.type === constants.REHYDRATE) {
          if (isEqual(action.payload, {bar: {a: 'b'}})) {
            done()
          }
        }
      }
    })
    let seedState = {foo: 3, bar: 4}
    const persistor = persistStore(store, { storage: createMemoryStorage(seedState) }, (err, state) => {
      if (err) throw new Error()
      persistor.rehydrate({bar: JSON.stringify({a: 'b'})}, {serial: true})
    })
  })
  it('processes adhoc rehydrate with serial: false', function (done) {
    let store = createMockStore({
      mockState: { foo: 3, bar: [1] },
      dispatch: (action) => {
        if (action.type === constants.REHYDRATE) {
          if (isEqual(action.payload, {bar: {a: 'b'}})) {
            done()
          }
        }
      }
    })
    let seedState = {foo: 3, bar: 4}
    const persistor = persistStore(store, { storage: createMemoryStorage(seedState) }, (err, state) => {
      if (err) throw new Error()
      persistor.rehydrate({bar: {a: 'b'}})
    })
  })
})
