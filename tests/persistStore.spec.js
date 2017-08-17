// @flow
import test from 'ava'
import sinon from 'sinon'

import _ from 'lodash'
import configureStore from 'redux-mock-store'

import persistStore from '../src/persistStore'
import { PERSIST, REHYDRATE } from '../src/constants'

let mockStore = configureStore([])

test('persistStore dispatches PERSIST action', t => {
  let store = mockStore()
  let persistor = persistStore(store)
  let actions = store.getActions()
  let persistAction  =_.find(actions, { type: PERSIST })
  t.truthy(persistAction)
})

test('register method adds a key to the registry', t => {
  let store = mockStore()
  let persistor = persistStore(store)
  let actions = store.getActions()
  let persistAction  =_.find(actions, { type: PERSIST })
  persistAction.register('canary')
  t.deepEqual(persistor.getState().registry, ['canary'])
})

test('rehydrate method fires with the expected shape', t => {
  let store = mockStore()
  let persistor = persistStore(store)
  let actions = store.getActions()
  let persistAction  =_.find(actions, { type: PERSIST })
  persistAction.rehydrate('canary', { foo: 'bar' }, null)
  let rehydrateAction  =_.find(actions, { type: REHYDRATE })
  t.deepEqual(rehydrateAction, { type: REHYDRATE, key: 'canary', payload: { foo: 'bar' }, err: null })
})

test('rehydrate method removes provided key from registry', t => {
  let store = mockStore()
  let persistor = persistStore(store)
  let actions = store.getActions()
  let persistAction  =_.find(actions, { type: PERSIST })

  // register canary
  persistAction.register('canary')
  t.deepEqual(persistor.getState().registry, ['canary'])

  // rehydrate canary
  persistAction.rehydrate('canary', { foo: 'bar' }, null)
  t.deepEqual(persistor.getState().registry, [])
})

test('rehydrate method removes exactly one of provided key from registry', t => {
  let store = mockStore()
  let persistor = persistStore(store)
  let actions = store.getActions()
  let persistAction  =_.find(actions, { type: PERSIST })

  // register canary twice
  persistAction.register('canary')
  persistAction.register('canary')
  t.deepEqual(persistor.getState().registry, ['canary', 'canary'])

  // rehydrate canary
  persistAction.rehydrate('canary', { foo: 'bar' }, null)
  t.deepEqual(persistor.getState().registry, ['canary'])
})

test('once registry is cleared for first time, persistor is flagged as bootstrapped', t => {
  let store = mockStore()
  let persistor = persistStore(store)
  let actions = store.getActions()
  let persistAction  =_.find(actions, { type: PERSIST })

  persistAction.register('canary')
  t.false(persistor.getState().bootstrapped)
  persistAction.rehydrate('canary', { foo: 'bar' }, null)
  t.true(persistor.getState().bootstrapped)
})

test('once persistor is flagged as bootstrapped, further registry changes do not affect this value', t => {
  let store = mockStore()
  let persistor = persistStore(store)
  let actions = store.getActions()
  let persistAction  =_.find(actions, { type: PERSIST })

  persistAction.register('canary')
  t.false(persistor.getState().bootstrapped)
  persistAction.rehydrate('canary', { foo: 'bar' }, null)
  t.true(persistor.getState().bootstrapped)

  // add canary back, registry is updated but bootstrapped remains true
  persistAction.register('canary')
  t.deepEqual(persistor.getState().registry, ['canary'])
  t.true(persistor.getState().bootstrapped)
})

test('persistStore calls bootstrapped callback (at most once) if provided', t => {
  let store = mockStore()
  let bootstrappedCb = sinon.spy()  
  let persistor = persistStore(store, {}, bootstrappedCb)
  let actions = store.getActions()
  let persistAction  =_.find(actions, { type: PERSIST })
  
  persistAction.register('canary')
  persistAction.rehydrate('canary', { foo: 'bar' }, null)
  t.is(bootstrappedCb.callCount, 1)

  // further rehydrates do not trigger the cb
  persistAction.register('canary')
  persistAction.rehydrate('canary', { foo: 'bar' }, null)
  t.is(bootstrappedCb.callCount, 1)
})