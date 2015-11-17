import isPlainObject from 'lodash.isplainobject'
import bufferActions from './bufferActions'
import { REHYDRATE } from './constants'

module.exports = function autoRehydrate (config = {}) {
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
    if (err) console.error(err)
    if (config.log) console.log('redux-persist/autoRehydrate action buffer released', queue)
  }

  function checkIsObject (data, reducedState, key) {
    if ((data.size || data.hasOwnProperty('size')) || (reducedState[key].size || reducedState[key].hasOwnProperty('size'))) {
      return true
    } else if (isPlainObject(data) || isPlainObject(reducedState[key])) {
      return true
    }
    return false
  }

  function createRehydrationReducer (reducer) {
    return (state, action) => {
      if (action.type === REHYDRATE) {
        let key = action.key
        let data = action.payload
        let reducedState = reducer(state, action)

        // if reducer modifies substate, skip auto rehydration
        if (state[key] !== reducedState[key]) {
          if (config.log) console.log('redux-persist/autoRehydrate sub state for key "%s" modified, skipping autoRehydrate', key)
          return reducedState
        }

        let autoReducedState = {...reducedState}
        let isObject = checkIsObject(data, reducedState, key)
        if (!isObject) {
          // assign value
          autoReducedState[key] = data
        } else {
          // shallow merge
          var subState = {}
          for (var subkey in reducedState[key]) { subState[subkey] = reducedState[key][subkey] }
          for (var datakey in data) { subState[datakey] = data[datakey] }
          autoReducedState[key] = subState
        }

        if (config.log) console.log('redux-persist/autoRehydrate key: %s, rehydrated to:', key, autoReducedState[key])
        return autoReducedState
      } else {
        return reducer(state, action)
      }
    }
  }
}
