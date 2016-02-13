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
      if (action.type !== REHYDRATE) return reducer(state, action)
      else {
        let inboundState = action.payload
        let reducedState = reducer(state, action)
        let newState = {...reducedState}

        Object.keys(inboundState).forEach((key) => {
          // if reducer modifies substate, skip auto rehydration
          if (state[key] !== reducedState[key]) {
            if (config.log) console.log('redux-persist/autoRehydrate sub state for key "%s" modified, skipping autoRehydrate', key)
            newState[key] = reducedState[key]
            return
          }

          // otherwise take the inboundState
          if (statesArePlain(inboundState[key], reducedState[key])) newState[key] = {...state[key], ...inboundState[key]} // shallow merge
          else newState[key] = inboundState[key] // hard set

          if (config.log) console.log('redux-persist/autoRehydrate key: %s, rehydrated to:', key, newState[key])
        })
        return newState
      }
    }
  }
}

function statesArePlain (a, b) {
  return isPlainObject(a) && isPlainObject(b)
}
