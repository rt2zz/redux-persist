'use strict'

var filter = require('lodash.filter')
var map = require('lodash.map')
var forEach = require('lodash.foreach')

var keyPrefix = 'reduxPersistStore:'

function persistStore(store, config, cb){
  //defaults
  config = config || {}
  var blacklist = config.blacklist || []
  var actionCreator = config.actionCreator || defaultActionCreator
  var storage = config.storage || defaultStorage

  //initialize values
  let timeIterator = null
  let lastState = store.getState()

  //rehydrate
  let restoreCount = 0
  let completionCount = 0
  forEach(lastState, function(s, key){
    if(blacklist.indexOf(key) !== -1){ return }
    restoreCount += 1
    setImmediate(function(){
      rehydrate(key, function(){
        completionCount += 1
        if(completionCount === restoreCount){
          cb && cb()
        }
      })
    })
  })

  //store state to disk
  var unsub = store.subscribe(function(){
    //Clear unfinished timeIterator if exists
    if(timeIterator !== null){
      clearInterval(timeIterator)
    }

    let state = store.getState()
    let storesToProcess = filter(map(state, function(subState, key){
      if(blacklist.indexOf(key) !== -1){ return }
      //only store keys that have changed
      return lastState[key] !== state[key] ? key : false
    }))

    //time iterator runs every 33ms (30fps)
    let i = 0
    timeIterator = setInterval(function(){
      if(i === storesToProcess.length){
        clearInterval(timeIterator)
        return
      }
      storage.setItem(createStorageKey(storesToProcess[i]), JSON.stringify(state[storesToProcess[i]]), function(err){
        if(err){
          console.warn('Error storing key ', storesToProcess[i], state[storesToProcess[i]])
        }
      })
      i += 1
    }, 33)

    lastState = state
  })

  function rehydrate(key, cb){
    storage.getItem(createStorageKey(key), function(err, serialized){
      try{
        if(err){ throw err }
        let data = JSON.parse(serialized)
        store.dispatch(actionCreator(key, data))
      }
      catch(e){
        console.warn('Error restoring data for key:', key, e)
        storage.removeItem(key, function(err){
          if(err){ /* @TODO */}
        })
      }
      cb()
    })
  }
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

var defaultStorage = {
  getItem: function(key, cb){
    try{
      var s = localStorage.getItem(key)
      cb(null, s)
    }
    catch(e){
      cb(e)
    }
  },
  setItem: function(key, string, cb){
    try{
      localStorage.setItem(key, string)
      cb(null)
    }
    catch(e){
      cb(e)
    }
  },
  removeItem: function(key, cb){
    try{
      localStorage.removeItem(key)
      cb(null)
    }
    catch(e){
      cb(e)
    }
  }
}

module.exports = persistStore
