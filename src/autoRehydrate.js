var {compose} = require('redux')
var bufferActions = require('./bufferActions')
var constants = require('./constants')

module.exports = function autoRehydrate(config){
  config = config || {}

  return function(next){
    return function(reducer, initialState){
      rehydrationReducer = createRehydrationReducer(reducer)

      // buffer actions
      const store = next(rehydrationReducer, initialState)
      const dispatch = compose(
        bufferActions(onBufferEnd),
        //@TODO middleware to unlift reducer?
        store.dispatch
      )

      return {
        ...store,
        dispatch
      }
    }
  }

  function onBufferEnd(err, queue){
    if(config.log){
      console.log('redux-persist/autoRehydrate Buffer Released', queue)
    }
  }

  function createRehydrationReducer(reducer){
    return function(state, action){
      if(action.meta && action.meta[constants.actionMeta.rehydrate] === true){
        let key = action.key
        let data = action.payload

        var reducedState = reducer(state, action)
        if(state[key] !== reducedState[key]){
          if(config.log){
            console.log('redux-persist/autoRehydrate sub state for key %s modified, skipping autoRehydrate', key)
          }
          return reducedState
        }
        var subState = {}
        for (var subkey in reducedState[key]) { subState[subkey] = reducedState[key][subkey] }
        for (var subkey in data) { subState[subkey] = data[subkey] }
        reducedState[key] = subState
        if(config.log){
          console.log('redux-persist/autoRehydrate key: %s, rehydrated to:', key, subState)
        }
        return reducedState
      }
      else{
        return reducer(state, action)
      }
    }
  }
}
