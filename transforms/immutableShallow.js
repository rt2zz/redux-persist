var Immutable = require('immutable')
var foreach = require('lodash.foreach')

var tracker = '_reduxPersistImmutableShallow'

module.exports = {
  in: function(state){
    if(typeof state !== 'object'){
      return state
    }
    if(Immutable.Iterable.isIterable(state)){
      return deconstruct(state)
    }
    var newState = {}
    foreach(state, function(subState, key){
      if(Immutable.Iterable.isIterable(subState)){
        newState[key] = deconstruct(subState)
      }
      else{
        newState[key] = subState
      }
    })
    return newState
  },
  out: function(rawState){
    if(typeof rawState !== 'object'){
      return rawState
    }
    if(rawState[tracker] === true){
      return construct(rawState)
    }
    var newState = {}
    foreach(rawState, function(rawSubState, key){
      if(typeof rawSubState !== 'object' || !rawSubState){
        return rawSubState
      }
      if(rawSubState[tracker] === true){
        newState[key] = construct(rawSubState)
      }
      else{
        newState[key] = rawSubState
      }
    })
    return newState
  }
}

function deconstruct(state){
  var newState = state.toJS()
  newState[tracker] = true
  return newState
}

function construct(raw){
  delete raw[tracker]
  return Array.isArray(raw) ? Immutable.List(raw) : Immutable.Map(raw)
}
