import configureStore from 'redux-mock-store'

import persistStore from '../src/persistStore'
import { PERSIST, REHYDRATE } from '../src/constants'
import find from './utils/find'

const mockStore = configureStore([])

test('persistStore dispatches PERSIST action', () => {
  const store = mockStore()
  persistStore(store)
  const actions = store.getActions()
  const persistAction = find(actions, { type: PERSIST })
  expect(persistAction).toBeTruthy()
})

test('register method adds a key to the registry', () => {
  const store = mockStore()
  const persistor = persistStore(store)
  const actions = store.getActions()
  const persistAction = find(actions, { type: PERSIST })
  persistAction.register('canary')
  expect(persistor.getState().registry).toEqual(['canary'])
})

test('rehydrate method fires with the expected shape', () => {
  const store = mockStore()
  persistStore(store)
  const actions = store.getActions()
  const persistAction = find(actions, { type: PERSIST })
  persistAction.rehydrate('canary', { foo: 'bar' }, null)
  const rehydrateAction = find(actions, { type: REHYDRATE })
  expect(rehydrateAction).toEqual({ type: REHYDRATE, key: 'canary', payload: { foo: 'bar' }, err: null })
})

test('rehydrate method removes provided key from registry', () => {
  const store = mockStore()
  const persistor = persistStore(store)
  const actions = store.getActions()
  const persistAction = find(actions, { type: PERSIST })

  // register canary
  persistAction.register('canary')
  expect(persistor.getState().registry).toEqual(['canary'])

  // rehydrate canary
  persistAction.rehydrate('canary', { foo: 'bar' }, null)
  expect(persistor.getState().registry).toEqual([])
})

test('rehydrate method removes exactly one of provided key from registry', () => {
  const store = mockStore()
  const persistor = persistStore(store)
  const actions = store.getActions()
  const persistAction = find(actions, { type: PERSIST })

  // register canary twice
  persistAction.register('canary')
  persistAction.register('canary')
  expect(persistor.getState().registry).toEqual(['canary', 'canary'])

  // rehydrate canary
  persistAction.rehydrate('canary', { foo: 'bar' }, null)
  expect(persistor.getState().registry).toEqual(['canary'])
})

test('once registry is cleared for first time, persistor is flagged as bootstrapped', () => {
  const store = mockStore()
  const persistor = persistStore(store)
  const actions = store.getActions()
  const persistAction = find(actions, { type: PERSIST })

  persistAction.register('canary')
  expect(persistor.getState().bootstrapped).toBe(false)
  persistAction.rehydrate('canary', { foo: 'bar' }, null)
  expect(persistor.getState().bootstrapped).toBe(true)
})

test('once persistor is flagged as bootstrapped, further registry changes do not affect this value', () => {
  const store = mockStore()
  const persistor = persistStore(store)
  const actions = store.getActions()
  const persistAction = find(actions, { type: PERSIST })

  persistAction.register('canary')
  expect(persistor.getState().bootstrapped).toBe(false)
  persistAction.rehydrate('canary', { foo: 'bar' }, null)
  expect(persistor.getState().bootstrapped).toBe(true)

  // add canary back, registry is updated but bootstrapped remains true
  persistAction.register('canary')
  expect(persistor.getState().registry).toEqual(['canary'])
  expect(persistor.getState().bootstrapped).toBe(true)
})

test('persistStore calls bootstrapped callback (at most once) if provided', () => {
  const store = mockStore()
  const bootstrappedCb = jest.fn()
  persistStore(store, {}, bootstrappedCb)
  const actions = store.getActions()
  const persistAction = find(actions, { type: PERSIST })

  persistAction.register('canary')
  persistAction.rehydrate('canary', { foo: 'bar' }, null)
  expect(bootstrappedCb).toHaveBeenCalledTimes(1)

  // further rehydrates do not trigger the cb
  persistAction.register('canary')
  persistAction.rehydrate('canary', { foo: 'bar' }, null)
  expect(bootstrappedCb).toHaveBeenCalledTimes(1)
})
