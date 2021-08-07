import test from 'ava'
import sinon from 'sinon'

import configureStore from 'redux-mock-store'

import persistReducer from '../src/persistReducer'
import createMemoryStorage from './utils/createMemoryStorage'
import { PERSIST, REHYDRATE } from '../src/constants'
import sleep from './utils/sleep'

let mockStore = configureStore([])
let reducer = () => ({})
const config = {
  key: 'persist-reducer-test',
  version: 1,
  storage: createMemoryStorage()
}

test('persistedReducer does not automatically set _persist state', t => {
  let persistedReducer = persistReducer(config, reducer)
  let state = persistedReducer({}, {type: "UNDEFINED"})
  console.log('state', state)
  t.is(undefined, state._persist)
})

test('persistedReducer does returns versioned, rehydrate tracked _persist state upon PERSIST', t => {
  let persistedReducer = persistReducer(config, reducer)
  let register = sinon.spy()
  let rehydrate = sinon.spy()
  let state = persistedReducer({}, { type: PERSIST, register, rehydrate })
  t.deepEqual({ version: 1, rehydrated: false}, state._persist)
})

test('persistedReducer calls register and rehydrate after PERSIST', async (t) => {
  let persistedReducer = persistReducer(config, reducer)
  let register = sinon.spy()
  let rehydrate = sinon.spy()
  let state = persistedReducer({}, { type: PERSIST, register, rehydrate })
  await sleep(5000)
  t.is(register.callCount, 1)
  t.is(rehydrate.callCount, 1)
})
