import test from 'ava'

import { persistStore, getStoredState } from '../src'
import * as constants from '../src/constants'
import isEqual from 'lodash/isEqual'
import createMemoryStorage from './helpers/createMemoryStorage'

function createMockStore (opts) {
  return {
    subscribe: opts.subscribe || function () {},
    dispatch: opts.dispatch || function () {},
    getState: () => {
      return opts.mockState ? {...opts.mockState} : {}
    }
  }
}

test.cb('Returns state to persistStore callback', (t) => {
  let store = createMockStore({
    mockState: {foo: 1, bar: 2},
    dispatch: () => {}
  })

  let seedState = {foo: 3, bar: 4}
  persistStore(store, { storage: createMemoryStorage(seedState) }, (err, state) => {
    t.ifError(err, 'persistStore errored')
    t.deepEqual(state, seedState)
    t.pass()
    t.end()
  })
})

test.cb('returns stored state', (t) => {
  let seedState = {foo: 3, bar: 4}
  getStoredState({ storage: createMemoryStorage(seedState) }, (err, state) => {
    t.ifError(err, 'persistStore errored')
    t.deepEqual(state, seedState)
    t.pass()
    t.end()
  })
})

test.cb('processes adhoc rehydrate with serial: true', (t) => {
  let store = createMockStore({
    mockState: { foo: 3, bar: [1] },
    dispatch: (action) => {
      if (action.type === constants.REHYDRATE) {
        if (isEqual(action.payload, {bar: {a: 'b'}})) {
          t.pass()
          t.end()
        }
      }
    }
  })

  let seedState = {foo: 3, bar: 4}
  const persistor = persistStore(store, { storage: createMemoryStorage(seedState) }, (err, state) => {
    if (err) throw new Error()
    persistor.rehydrate({bar: JSON.stringify({a: 'b'})}, {serial: true})
  })

  setTimeout(() => {
    throw new Error('timeout')
  }, 10000)
})

test.cb('processes adhoc rehydrate with serial: false', (t) => {
  let store = createMockStore({
    mockState: { foo: 3, bar: [1] },
    dispatch: (action) => {
      if (action.type === constants.REHYDRATE) {
        if (isEqual(action.payload, {bar: {a: 'b'}})) {
          t.pass()
          t.end()
        }
      }
    }
  })

  let seedState = {foo: 3, bar: 4}
  const persistor = persistStore(store, { storage: createMemoryStorage(seedState) }, (err, state) => {
    if (err) throw new Error()
    persistor.rehydrate({bar: {a: 'b'}})
  })

  setTimeout(() => {
    throw new Error('timeout')
  }, 10000)
})
