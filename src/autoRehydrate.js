import { compose } from 'redux'
import isPlainObject from 'lodash.isplainobject'
import bufferActions from './bufferActions'
import { REHYDRATE } from './constants'

module.exports = function autoRehydrate (config) {
  config = config || {}

  return (next) => (reducer, initialState) => {
    const rehydrationReducer = createRehydrationReducer(reducer)

    // buffer actions
    const store = next(rehydrationReducer, initialState)
    const dispatch = bufferActions(onBufferEnd)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }

  function onBufferEnd (err, queue) {
    if (err) { console.error(err) }
    if (config.log) { console.log('redux-persist/autoRehydrate action buffer released', queue) }
  }

  function createRehydrationReducer (reducer) {
    return (state, action) => {
      if (action.type === REHYDRATE) {
        let key = action.key
        let data = action.payload
        let reducedState = reducer(state, action)

        if (state[key] !== reducedState[key]) {
          // if reducer modifies substate, skip auto rehydration
          if (config.log) { console.log('redux-persist/autoRehydrate sub state for key "%s" modified, skipping autoRehydrate', key) }
          return reducedState
        }

        if (!isPlainObject(data) || !isPlainObject(reducedState[key])) {
          // substates are not objects -> assign value
          reducedState[key] = data
        } else {
          // substates are objects -> shallow merge
          var subState = {}
          for (var subkey in reducedState[key]) { subState[subkey] = reducedState[key][subkey] }
          for (var datakey in data) { subState[datakey] = data[datakey] }
          reducedState[key] = subState
        }

        if (config.log) { console.log('redux-persist/autoRehydrate key: %s, rehydrated to:', key, subState) }
        return reducedState
      } else {
        return reducer(state, action)
      }
    }
  }
}
