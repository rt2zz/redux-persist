'use strict'

var filter = require('lodash.filter')
var map = require('lodash.map')
var forEach = require('lodash.forEach')

var keyPrefix = 'reduxPersistStore:'

function persistStore(store, rules, actionCreator, cb){
  //defaults
  rules = rules || {}
  actionCreator = actionCreator || defaultActionCreator

  //initialize values
  let timeIterator = null
  let lastState = store.getState()

  //rehydrate
  forEach(lastState, function(subState, key){
    if(rules[key] === false){ return }
    try{
      let serialized = localStorage.getItem(createStorageKey(key))
      let data = JSON.parse(serialized)
      store.dispatch(actionCreator(key, data))
    }
    catch(e){
      console.warn('Error restoring data for key:', key, e)
      try {
        localStorage.removeItem(key)
      }
      catch(e){
        //uhoh..
      }
    }
  })

  cb && cb()


  //store state to disk
  var unsub = store.subscribe(function(){

    //Clear unfinished timeIterator if exists
    if(timeIterator !== null){
      clearInterval(timeIterator)
    }

    let state = store.getState()
    let storesToProcess = filter(map(state, function(subState, key){
      if(rules[key] === false){ return }
      //only store keys that have changed
      return lastState[key] !== state[key] ? key : false
    }))

    //time iterator runs every 33ms (30fps)
    let i = 0
    var timeIterator = setInterval(function(){
      if(i === storesToProcess.length){
        clearInterval(timeIterator)
        return
      }
      try{
        localStorage.setItem(createStorageKey(storesToProcess[i]), JSON.stringify(state[storesToProcess[i]]))
      }
      catch(e){
        console.warn('Error storing key ', storesToProcess[i], state[storesToProcess[i]])
      }
      i += 1
    }, 33)

    lastState = state
  })
}

persistStore.purge = function(keys){
  forEach(keys, function(key){
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

function defaultActionCreator(key, data){
  return {
    type: 'REHYDRATE',
    reducer: key,
    data: data,
  }
}

module.exports = persistStore
