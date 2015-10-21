'use strict'
var forEach = require('lodash.foreach')
var constants = require('./constants')
var defaultStorage = require('./defaults/asyncLocalStorage')

module.exports = function persistStore (store, config, cb) {
  // defaults
  config = config || {}
  const blacklist = config.blacklist || []
  const whitelist = config.whitelist || false
  const rehydrateAction = config.rehydrateAction || defaultRehydrateAction
  const completeAction = config.completeAction || defaultCompleteAction
  const serialize = config.serialize || defaultSerialize
  const deserialize = config.deserialize || defaultDeserialize
  const transforms = config.transforms || []
  const storage = config.storage || defaultStorage
  const debounce = config.debounce || 33

  // initialize values
  let timeIterator = null
  let lastState = store.getState()
  let purgeMode = false
  let restoreCount = 0
  let completionCount = 0
  let storesToProcess = []

  forEach(lastState, (s, key) => {
    if (whitelistBlacklistCheck(key)) { return }
    restoreCount += 1
    setImmediate(() => {
      restoreKey(key, () => {
        completionCount += 1
        if (completionCount === restoreCount) { rehydrationComplete() }
      })
    })
  })
  if (restoreCount === 0) { rehydrationComplete() }

  // store state to disk
  store.subscribe(() => {
    // clear unfinished timeIterator if exists
    if (timeIterator !== null) {
      clearInterval(timeIterator)
    }

    let state = store.getState()
    forEach(state, function (subState, key) {
      if (whitelistBlacklistCheck(key)) { return }
      if (lastState[key] === state[key]) { return }
      if (storesToProcess.indexOf(key) !== -1) { return }
      storesToProcess.push(key)
    })

    // time iterator (read: debounce)
    timeIterator = setInterval(() => {
      if (storesToProcess.length === 0) {
        clearInterval(timeIterator)
        return
      }

      let key = createStorageKey(storesToProcess[0])
      let endState = transforms.reduce((subState, transformer) => {
        return transformer.in(subState)
      }, state[storesToProcess[0]])
      if (typeof endState !== 'undefined') {
        let serial = serialize(endState)
        storage.setItem(key, serial, warnIfSetError(key))
      }
      storesToProcess.shift()
    }, debounce)

    lastState = state
  })

  function whitelistBlacklistCheck (key) {
    if (whitelist && whitelist.indexOf(key) === -1) { return true }
    if (blacklist.indexOf(key) !== -1) { return true }
    return false
  }

  function restoreKey (key, cb) {
    storage.getItem(createStorageKey(key), function (err, serialized) {
      if (err && process.env.NODE_ENV !== 'production') console.warn('Error restoring data for key:', key, err)
      else rehydrate(key, serialized, cb)
    })
  }

  function rehydrate (key, serialized, cb) {
    let state = null
    try {
      let data = deserialize(serialized)
      state = transforms.reduceRight((subState, transformer) => {
        return transformer.out(subState)
      }, data)
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.warn('Error restoring data for key:', key, err)
      storage.removeItem(key, warnIfRemoveError(key))
    }

    if (state !== null) {
      if (purgeMode === '*' || (Array.isArray(purgeMode) && purgeMode.indexOf(key) !== -1)) { return }
      store.dispatch(rehydrateAction(key, state))
    }
    cb()
  }

  function rehydrationComplete () {
    store.dispatch(completeAction())
    cb && cb()
  }

  return {
    rehydrate: rehydrate,
    purge: (keys) => {
      purgeMode = keys
      forEach(keys, (key) => {
        storage.removeItem(createStorageKey(key), warnIfRemoveError(key))
      })
    },
    purgeAll: () => {
      purgeMode = '*'
      storage.getAllKeys((err, keys) => {
        if (err) { console.warn(err) }
        forEach(keys, function (key) {
          if (key.indexOf(constants.keyPrefix) === 0) {
            storage.removeItem(key, warnIfRemoveError(key))
          }
        })
      })
    }
  }
}

function warnIfRemoveError (key) {
  return function removeError (err) {
    if (err && process.env.NODE_ENV !== 'production') { console.warn('Error storing data for key:', key, err) }
  }
}

function warnIfSetError (key) {
  return function setError (err) {
    if (err && process.env.NODE_ENV !== 'production') { console.warn('Error storing data for key:', key, err) }
  }
}

function createStorageKey (key) {
  return constants.keyPrefix + key
}

function defaultRehydrateAction (key, data) {
  return {
    type: constants.REHYDRATE,
    key: key,
    payload: data
  }
}

function defaultCompleteAction () {
  return {
    type: constants.REHYDRATE_COMPLETE
  }
}

function defaultSerialize (data) {
  return JSON.stringify(data)
}

function defaultDeserialize (serial) {
  return JSON.parse(serial)
}
