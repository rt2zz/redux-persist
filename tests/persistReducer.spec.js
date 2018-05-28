// @flow

import test from 'ava'
import sinon from 'sinon'

import _ from 'lodash'
import configureStore from 'redux-mock-store'

import persistReducer from '../src/persistReducer'
import createMigrate from '../src/createMigrate'
import { createMemoryStorage } from 'storage-memory'
import { PERSIST, REHYDRATE } from '../src/constants'
import type { MigrationManifest } from '../src/types'
import sleep from './utils/sleep'

let mockStore = configureStore([])
let reducer = () => ({})

const migrations: MigrationManifest = {
  [0]: (state) => {
    return {
      ...state
    }
  },
  [1]: (state) => {
    return {
      ...state
    }
  }
}

const config = {
  key: 'persist-reducer-test',
  version: 1,
  storage: createMemoryStorage(),
  migrate: createMigrate(migrations)
}

test('persistedReducer does not automatically set _persist state', t => {
  let persistedReducer = persistReducer(config, reducer)
  let state = persistedReducer({}, {})
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
  await sleep(1)
  t.is(register.callCount, 1)
  t.is(rehydrate.callCount, 1)
})