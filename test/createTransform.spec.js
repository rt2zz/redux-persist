import test from 'ava'

import { createStore } from 'redux'

import { createTransform, getStoredState, persistStore } from '../src'
import createMemoryStorage from './helpers/createMemoryStorage'
const ACTION_MUTATE_ALL = 'ACTION_MUTATE_ALL'

const createReducer = () => {
  return (state = {a: 1, b: 2}, action) => {
    if (action.type === ACTION_MUTATE_ALL) {
      return {a: 10, b: 20}
    }
    return state
  }
}

test('createTransform outbound', async function (t) {
  const seedState = {a: 1, b: {b0: 2}}

  const inbound = (state, key) => key
  const outbound = (state, key) => 'hi'
  let testTransform = createTransform(inbound, outbound)

  let state = await getStoredState({storage: createMemoryStorage(seedState), transforms: [testTransform]})
  t.deepEqual(state, {a: 'hi', b: 'hi'})
})

test.cb('createTransform inbound', (t) => {
  const store = createStore(createReducer())
  const seedState = {a: 1, b: {b0: 2}}

  const inbound = (state, key) => key
  const outbound = (state, key) => 'hi'

  const memoryStorage = createMemoryStorage(seedState)
  const testTransform = createTransform(inbound, outbound)
  const config = {storage: memoryStorage, transforms: [testTransform]}
  persistStore(store, config, (err, restoredState) => {
    t.ifError(err)
    // t.deepEqual(restoredState, {a: 'hi', b: 'hi'})

    store.dispatch({type: ACTION_MUTATE_ALL})

    setImmediate(async () => {
      const state = await getStoredState({storage: memoryStorage})
      t.deepEqual(state, {a: 'a', b: 'b'})
      t.end()
    })
  })
})
