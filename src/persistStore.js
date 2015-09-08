'use strict'
var forEach = require('lodash.foreach')
var constants = require('./constants')
var defaultStorage = require('./defaults/asyncLocalStorage')

module.exports = function persistStore(store, config, cb){
  //defaults
  config = config || {}
  const blacklist = config.blacklist || []
  const whitelist = config.whitelist || false
  const rehydrateAction = config.rehydrateAction || defaultRehydrateAction
  const completeAction = config.completeAction || defaultCompleteAction
  const serialize = config.serialize || defaultSerialize
  const deserialize = config.deserialize || defaultDeserialize
  const transforms = config.transforms || []
  const storage = config.storage || defaultStorage

  //initialize values
  let timeIterator = null
  let lastState = store.getState()

  //rehydrate
  let restoreCount = 0
  let completionCount = 0
  if(Object.keys(lastState).length === 0){ store.dispatch(completeAction()) }
  forEach(lastState, function(s, key){
    //check blacklist, and whitelist if set
    if(whitelist && whitelist.indexOf(key) === -1){ return }
    if(blacklist.indexOf(key) !== -1){ return }
    restoreCount += 1
    setImmediate(function(){
      restoreKey(key, function(){
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
      if(whitelist && whitelist.indexOf(key) === -1){ return }
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
        storage.setItem(key, serial, warnIfSetError(key))
      }
      storesToProcess.shift()
    }, 33)

    lastState = state
  })

  let purgeMode = false

  function restoreKey(key, cb) {
    storage.getItem(createStorageKey(key), function (err, serialized) {
      if (err && process.env.NODE_ENV !== 'production') { console.warn('Error restoring data for key:', key, err) }
      else{
        rehydrate(key, serialized, cb)
      }
    })
  }

  function rehydrate(key, serialized, cb){
    let state = null
    try{
      let data = deserialize(serialized)
      state = transforms.reduceRight(function(subState, transformer){
        return transformer.out(subState)
      }, data)
    }
    catch(err){
      if(process.env.NODE_ENV !== 'production'){ console.warn('Error restoring data for key:', key, err) }
      storage.removeItem(key, warnIfRemoveError(key))
    }
    if(state !== null){
      if(purgeMode === '*' || (Array.isArray(purgeMode) && purgeMode.indexOf(key) !== -1)){ return }
      store.dispatch(rehydrateAction(key, state))
    }
    cb()
  }

  return {
    rehydrate: rehydrate,
    purge: function(keys){
      purgeMode = keys
      forEach(keys, function(key){
        storage.removeItem(createStorageKey(key), warnIfRemoveError(key))
      })
    },
    purgeAll: function(){
      purgeMode = '*'
      storage.getAllKeys(function(err, keys){
        forEach(keys, function(key){
          if(key.indexOf(constants.keyPrefix) === 0){
            storage.removeItem(key, warnIfRemoveError(key))
          }
        })
      })
    }
  }
}

function warnIfRemoveError(key){
  return function removeError(err) {
    if(err && process.env.NODE_ENV !== 'production'){ console.warn('Error storing data for key:', key, err) }
  }
}

function warnIfSetError(key){
  return function setError(err) {
    if(err && process.env.NODE_ENV !== 'production'){ console.warn('Error storing data for key:', key, err) }
  }
}

function createStorageKey(key){
  return constants.keyPrefix+key
}

function defaultRehydrateAction(key, data){
  return {
    type: constants.REHYDRATE,
    key: key,
    payload: data,
  }
}

function defaultCompleteAction(){
  return {
    type: constants.REHYDRATE_COMPLETE,
  }
}

function defaultSerialize(data){
  return JSON.stringify(data)
}

function defaultDeserialize(serial){
  return JSON.parse(serial)
}
