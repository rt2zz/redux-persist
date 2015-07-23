'use strict'

var _ = require('lodash')

exports['default'] = persistStore

function persistStore(store, rules, actionCreator){
  rules = rules || {}

  actionCreator = actionCreator || function(key, data){
    return {
      type: 'REHYDRATE',
      reducer: key,
      data: data,
    }
  }

  var timeIterator = null
  var lastState = store.getState()


  _.each(lastState, function(subState, key){
    if(rules[key] === false){ return }
    let serialized = localStorage.getItem(createStorageKey(key))
    let data = JSON.parse(serialized)
    store.dispatch(actionCreator(key, data))
  })

  var unsub = store.subscribe(function(){

    if(timeIterator !== null){
      clearInterval(timeIterator)
    }

    let state = store.getState()
    let storesToProcess = _.filter(_.map(state, function(subState, key){
      if(rules[key] === false){ return }
      return lastState[key] !== state[key] ? key : false
    }))

    let i = 0
    var timeIterator = setInterval(function(){
      if(i === storesToProcess.length){
        clearInterval(timeIterator)
        return
      }
      localStorage.setItem(createStorageKey(storesToProcess[i]), JSON.stringify(state[storesToProcess[i]]))
      i += 1
    }, 33)

    lastState = state
  })
}

var keyPrefix = 'reduxPersistStore:'

persistStore.purge = function(keys){
  _.each(keys, function(key){
    localStorage.removeItem(createStorageKey(key))
  })
}

persistStore.purgeAll = function(keys){
  for (var key in localStorage){
    if(key.indexOf(keyPrefix) === 0){
      localStorage.removeItem(key)
    }
  }
}

function createStorageKey(key){
  return keyPrefix+key
}

module.exports = exports['default']
