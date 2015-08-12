'use strict'
var forEach = require('lodash.foreach')
var constants = require('./constants')

module.exports = function persistStore(store, config, cb){
  //defaults
  config = config || {}
  var blacklist = config.blacklist || []
  var rehydrateAction = config.rehydrateAction || defaultRehydrateAction
  var completeAction = config.completeAction || defaultCompleteAction
  var serialize = config.serialize || defaultSerialize
  var deserialize = config.deserialize || defaultDeserialize
  var transforms = config.transforms || []
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
          store.dispatch(completeAction())
          cb && cb()
        }
      })
    })
  })

  let storesToProcess = []
  //store state to disk
  var unsub = store.subscribe(function(){
    //Clear unfinished timeIterator if exists
    if(timeIterator !== null){
      clearInterval(timeIterator)
    }

    let state = store.getState()
    forEach(state, function(subState, key){
      if(blacklist.indexOf(key) !== -1){ return }
      //only store keys that have changed
      if(lastState[key] === state[key]){ return }
      if(storesToProcess.indexOf(key) !== -1){ return }
      storesToProcess.push(key)
    })

    //time iterator runs every 33ms (30fps)
    timeIterator = setInterval(function(){
      if(storesToProcess.length === 0){
        clearInterval(timeIterator)
        return
      }

      let key = createStorageKey(storesToProcess[0])
      let endState = transforms.reduce(function(subState, transformer){
        return transformer.in(subState)
      }, state[storesToProcess[0]])
      if(typeof endState !== 'undefined'){
        let serial = serialize(endState)
        storage.setItem(key, serial, warnIfSetError)
      }
      storesToProcess.shift()
    }, 33)

    lastState = state
  })

  function rehydrate(key, cb){
    storage.getItem(createStorageKey(key), function(err, serialized){
      try{
        if(err){ throw err }
        let data = deserialize(serialized)
        let state = transforms.reduceRight(function(subState, transformer){
          return transformer.out(subState)
        }, data)
        store.dispatch(rehydrateAction(key, state))
      }
      catch(e){
        console.warn('Error restoring data for key:', key, e)
        storage.removeItem(key, warnIfRemoveError)
      }
      cb()
    })
  }

  return {
    purge: function(keys){
      forEach(keys, function(key){
        storage.removeItem(createStorageKey(key), warnIfRemoveError)
      })
    },
    purgeAll: function(){
      storage.getAllKeys(function(err, keys){
        forEach(keys, function(key){
          if(key.indexOf(constants.keyPrefix) === 0){
            storage.removeItem(key, warnIfRemoveError)
          }
        })
      })
    }
  }
}

function warnIfRemoveError(err){
  if(err){ console.warn('Error removing data for key:', key, err) }
}

function warnIfSetError(err){
  if(err){ console.warn('Error storing data for key:', key, err) }
}

function createStorageKey(key){
  return constants.keyPrefix+key
}

function defaultRehydrateAction(key, data){
  var meta = {}
  meta[constants.actionMeta.rehydrate] = true
  return {
    type: constants.REHYDRATE,
    meta: meta,
    key: key,
    payload: data,
  }
}

function defaultCompleteAction(){
  var meta = {}
  meta[constants.actionMeta.complete] = true
  return {
    type: constants.REHYDRATE_COMPLETE,
    meta: meta
  }
}

function defaultSerialize(data){
  return JSON.stringify(data)
}

function defaultDeserialize(serial){
  return JSON.parse(serial)
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
  },
  getAllKeys: function(cb){
    try{
      var keys = []
      for ( var i = 0, len = localStorage.length; i < len; ++i ) {
        keys.push(localStorage.key(i))
      }
      cb(null, keys)
    }
    catch(e){
      cb(err)
    }
  }
}
