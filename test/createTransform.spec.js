import test from 'ava'

import { createStore } from 'redux'

import { createTransform, getStoredState, persistStore } from '../src'
import createMemoryStorage from './helpers/createMemoryStorage'
const ACTION_MUTATE_ALL = 'ACTION_MUTATE_ALL'

const createReducer = (actionCallback) => {
  return (state = {a: 1, b: 2}, action) => {
    actionCallback && actionCallback(action)
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

// a terribly ugly test for inbound transforms @TODO rewrite
test.cb('createTransform inbound', (t) => {
  const store = createStore(createReducer())
  const seedState = {a: 1, b: {b0: 2}}

  const inbound = (state, key) => key
  const outbound = (state, key) => 'hi'
  let testTransform = createTransform(inbound, outbound)
  let memoryStorage = createMemoryStorage(seedState)
  persistStore(store, {storage: memoryStorage, transforms: [testTransform]})

  setTimeout(() => {
    store.dispatch({type: ACTION_MUTATE_ALL})
    setTimeout(async function () {
      let state = await getStoredState({storage: memoryStorage})
      t.deepEqual(state, {a: 'a', b: 'b'})
      t.pass()
      t.end()
    }, 20)
  }, 50)
})
