/* global it, describe */

import { persistStore, getStoredState } from '../src'
import constants from '../constants'
import createMemoryStorage from './mock/createMemoryStorage'
import assert from 'assert'
import { isEqual } from 'lodash'

function createMockStore (opts) {
  return {
    subscribe: opts.subscribe || () => {},
    dispatch: opts.dispatch || () => {},
    getState: () => {
      return opts.mockState ? {...opts.mockState} : {}
    }
  }
}

describe('persistStore scenarios', function () {
  it('Dispatch 2 REHYDRATE & 1 REHYDRATE_COMPLETE when restoring initialState: {foo:1, bar:2} storedState: {foo:1, bar:2}', function (done) {
    let rehydrateCount = 0
    let store = createMockStore({
      mockState: { foo: 1, bar: 2 },
      dispatch: (action) => {
        if (action.type === constants.REHYDRATE) {
          rehydrateCount++
        }
        if (action.type === constants.REHYDRATE_COMPLETE) {
          if (rehydrateCount === 2) { done() }
          else throw new Error()
        }
      }
    })

    persistStore(store, { storage: createMemoryStorage({foo: 1, bar: 2}) })
  })

  it('Dispatch 0 REHYDRATE & 1 REHYDRATE_COMPLETE when restoring initialState: {} storedState: {foo:1, bar:2}', function (done) {
    let rehydrateCount = 0
    let store = createMockStore({
      mockState: {},
      dispatch: (action) => {
        if (action.type === constants.REHYDRATE) {
          rehydrateCount++
        }
        if (action.type === constants.REHYDRATE_COMPLETE) {
          if (rehydrateCount === 0) { done() }
          else throw new Error()
        }
      }
    })

    persistStore(store, { storage: createMemoryStorage({foo: '1', bar: '2'}) })
  })

  it('Dispatch 0 REHYDRATE & 1 REHYDRATE_COMPLETE when restoring initialState: {foo:1, bar:2} storedState: {}', function (done) {
    let rehydrateCount = 0
    let store = createMockStore({
      mockState: {foo: 1, bar: 2},
      dispatch: (action) => {
        if (action.type === constants.REHYDRATE) {
          rehydrateCount++
        }
        if (action.type === constants.REHYDRATE_COMPLETE) {
          if (rehydrateCount === 0) { done() }
          else throw new Error()
        }
      }
    })

    persistStore(store, { storage: createMemoryStorage({}) })
  })

  it('Does not rehydrate when purgeAll is invoked', function (done) {
    let rehydrateCount = 0
    let store = createMockStore({
      mockState: {foo: 1, bar: 2},
      dispatch: (action) => {
        if (action.type === constants.REHYDRATE) {
          rehydrateCount++
        }
        if (action.type === constants.REHYDRATE_COMPLETE) {
          if (rehydrateCount === 0) { done() }
          else throw new Error()
        }
      }
    })

    persistStore(store, { storage: createMemoryStorage({foo: 1, bar: 2}) }).purgeAll()
  })

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
          if (action.payload === 'adhocPayload') done()
        }
      }
    })
    let seedState = {foo: 3, bar: 4}
    const persistor = persistStore(store, { storage: createMemoryStorage(seedState) }, (err, state) => {
      if (err) throw new Error()
      persistor.rehydrate('bar', '"adhocPayload"')
    })
  })
  it('processes adhoc rehydrate when skipRestore: true', function (done) {
    let store = createMockStore({
      mockState: { foo: 3, bar: [1] },
      dispatch: (action) => {
        if (action.type === constants.REHYDRATE) {
          if (action.key === 'bar' && action.payload === 'adhocPayload') done()
        }
      }
    })
    let seedState = {foo: 3, bar: 4}
    const persistor = persistStore(store, { storage: createMemoryStorage(seedState), skipRestore: true }, (err, state) => {
      if (err) throw new Error()
      persistor.rehydrate('bar', '"adhocPayload"')
    })
  })
})
