import isPlainObject from 'lodash.isplainobject'
import bufferActions from './bufferActions'
import { REHYDRATE } from './constants'

module.exports = function autoRehydrate (config = {}) {
  return (next) => (reducer, initialState, enhancer) => {
    const rehydrationReducer = createRehydrationReducer(reducer)

    // buffer actions
    const store = next(rehydrationReducer, initialState, enhancer)
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
        let statesArePlain = checkIfPlain(data, reducedState[key])
        if (!statesArePlain) {
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

function checkIfPlain (a, b) {
  // isPlainObject + duck type not immutable
  if (typeof a !== 'object' || typeof b !== 'object') return false
  if (typeof a.mergeDeep === 'function' || typeof b.mergeDeep === 'function') return false
  if (!isPlainObject(a) || !isPlainObject(b)) return false
  return true
}
