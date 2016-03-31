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
  it('Does not restore when skipRestore:true', function (done) {
    let store = createMockStore({
      mockState: {foo: 1, bar: 2},
      dispatch: (action) => {
        if (action.type === constants.REHYDRATE) {
          throw new Error('unexpected REHYDRATE')
        }
      }
    })

    persistStore(store, { storage: createMemoryStorage({foo: 1, bar: 2}), skipRestore: true }, () => {
      done()
    })
  })

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
  it('processes adhoc rehydrate', function (done) {
    let store = createMockStore({
      mockState: { foo: 3, bar: [1] },
      dispatch: (action) => {
        if (action.type === constants.REHYDRATE) {
          if (isEqual(action.payload, {bar: 'adhocPayload'})) {
            done()
          }
        }
      }
    })
    let seedState = {foo: 3, bar: 4}
    const persistor = persistStore(store, { storage: createMemoryStorage(seedState) }, (err, state) => {
      if (err) throw new Error()
      persistor.rehydrate(JSON.stringify({bar: 'adhocPayload'}))
    })
  })
  it('processes adhoc rehydrate when skipRestore: true', function (done) {
    let store = createMockStore({
      mockState: { foo: 3, bar: [1] },
      dispatch: (action) => {
        if (action.type === constants.REHYDRATE) {
          if (isEqual(action.payload, {bar: 'adhocPayload'})) {
            done()
          }
        }
      }
    })
    let seedState = {foo: 3, bar: 4}
    const persistor = persistStore(store, { storage: createMemoryStorage(seedState), skipRestore: true }, (err, state) => {
      if (err) throw new Error()
      persistor.rehydrate(JSON.stringify({bar: 'adhocPayload'}))
    })
  })
})
