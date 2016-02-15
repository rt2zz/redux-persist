/* global it, describe */

import { compose, createStore } from 'redux'
import assert from 'assert'
import { isEqual } from 'lodash'
import Immutable from 'immutable'

import { REHYDRATE } from '../constants'
import { autoRehydrate } from '../src'

const someString = 'someString'

const createReducer = (actionCallback) => {
  return (state = {arraySpace: ['someInitialValue']}, action) => {
    actionCallback && actionCallback(action)
    return state
  }
}

var finalCreateStore = compose(autoRehydrate())(createStore)

describe('rehydrate actions', function () {
  it('with array payload should overwrite substate', function () {
    let store = finalCreateStore(createReducer())
    store.dispatch(rehydrate({arraySpace: [1, 2]}))
    let state = store.getState()
    assert(isEqual(state, {arraySpace: [1, 2]}))
  })
  it('rehydrates string state', function () {
    let store = finalCreateStore(createReducer())
    store.dispatch(rehydrate({stringSpace: someString}))
    let state = store.getState()
    assert(isEqual(state.stringSpace, someString))
  })
  it('buffers actions correctly', function (done) {
    var actionHistory = []

    let store = finalCreateStore(createReducer(actionCallback))
    store.dispatch({type: 'TEST1'})
    store.dispatch(rehydrate({arraySpace: [1, 2]}))

    function actionCallback (action) {
      if (action.type.indexOf('@@redux') !== 0) actionHistory.push(action.type)
      if (action.type === 'TEST1') {
        assert(actionHistory.indexOf(action.type) === 1)
        done()
      }
    }
  })
})

const rehydrate = (payload) => ({type: REHYDRATE, payload})

describe('when rehydrating immutable data', () => {
  it('does not warn', () => {
    let store = finalCreateStore(createReducer())
    let immutableData = Immutable.Map({a: 1})
    store.dispatch(rehydrate({immutableSpace: immutableData}))
    let state = store.getState()
    assert(state.immutableSpace.equals(immutableData))
  })
})
