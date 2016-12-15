import test from 'ava'

import { createStore } from 'redux'
import Immutable from 'immutable'

import { REHYDRATE } from '../src/constants'
import { autoRehydrate } from '../src'

const someString = 'someString'

const createReducer = (actionCallback) => {
  return (state = {arraySpace: ['someInitialValue'], stringSpace: null, immutableSpace: null}, action) => {
    actionCallback && actionCallback(action)
    return state
  }
}

var configureStore = (reducer, initState) => createStore(reducer, initState, autoRehydrate())

test('rehydrate: with array payload should overwrite substate', (t) => {
  let store = configureStore(createReducer())
  store.dispatch(rehydrate({arraySpace: [1, 2]}))
  let state = store.getState()
  t.deepEqual(state.arraySpace, [1, 2])
})

test('rehydrate: should work with initState', (t) => {
  let store = configureStore(createReducer(), {a: 1})
  store.dispatch(rehydrate({a: 2}))
  let state = store.getState()
  t.deepEqual(state.a, 2)
})

test('rehydrate: rehydrates string state', (t) => {
  let store = configureStore(createReducer())
  store.dispatch(rehydrate({stringSpace: someString}))
  let state = store.getState()
  t.deepEqual(state.stringSpace, someString)
})

const rehydrate = (payload) => ({type: REHYDRATE, payload})

test('can rehydrating immutable state', (t) => {
  let store = configureStore(createReducer())
  let immutableData = Immutable.Map({a: 1})
  store.dispatch(rehydrate({immutableSpace: immutableData}))
  let state = store.getState()
  t.truthy(state.immutableSpace.equals(immutableData))
})

test('does not rehydrate unknown state keys', (t) => {
  let store = configureStore(createReducer())
  let someData = 1
  store.dispatch(rehydrate({someData}))
  let state = store.getState()
  t.truthy(state.someData === undefined)
})
