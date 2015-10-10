import { compose, createStore } from 'redux'
import assert from 'assert'

import { REHYDRATE } from '../constants'
import { autoRehydrate } from '../lib'

const reducer = (state = {arraySpace: ['someInitialValue']}) => state

var finalCreateStore = compose(autoRehydrate())(createStore)

describe('Rehydrate Actions', function() {
  it('with array payloud should overwrite substate', function() {
    let store = finalCreateStore(reducer)
    store.dispatch(rehydrate('arraySpace', [1, 2]))
    let state = store.getState()
    assert.equal(state.arraySpace, [1,2])
  })
})

const rehydrate = (key, payload) => ({ type: REHYDRATE, key, payload})
