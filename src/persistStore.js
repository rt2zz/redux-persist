import forEach from 'lodash.foreach'
import constants from './constants'
import createAsyncLocalStorage from './defaults/asyncLocalStorage'

export default function persistStore (store, config = {}, onComplete) {
  // defaults
  const blacklist = config.blacklist || []
  const whitelist = config.whitelist || false
  const rehydrateAction = config.rehydrateAction || defaultRehydrateAction
  const completeAction = config.completeAction || defaultCompleteAction
  const serialize = config.serialize || defaultSerialize
  const deserialize = config.deserialize || defaultDeserialize
  const transforms = config.transforms || []
  const storage = config.storage || createAsyncLocalStorage('local')
  const debounce = config.debounce || false
  const shouldRestore = !config.skipRestore
  const genericSetImmediate = typeof setImmediate === 'undefined' ? global.setImmediate : setImmediate

  // initialize values
  let timeIterator = null
  let lastState = store.getState()
  let purgeMode = false
  let restoreCount = 0
  let completionCount = 0
  let storesToProcess = []
  let restoredState = {}

  // restore
  if (shouldRestore) {
    forEach(lastState, (s, key) => {
      if (whitelistBlacklistCheck(key)) return
      restoreCount += 1
      genericSetImmediate(() => {
        restoreKey(key, (err, substate) => {
          if (err) substate = null
          completionCount += 1
          restoredState[key] = substate
          if (completionCount === restoreCount) rehydrationComplete()
        })
      })
    })
    if (restoreCount === 0) rehydrationComplete()
  }
  else rehydrationComplete()

  // store
  store.subscribe(() => {
    if (timeIterator !== null) clearInterval(timeIterator)

    let state = store.getState()
    forEach(state, (subState, key) => {
      if (whitelistBlacklistCheck(key)) return
      if (lastState[key] === state[key]) return
      if (storesToProcess.indexOf(key) !== -1) return
      storesToProcess.push(key)
    })

    // time iterator (read: debounce)
    timeIterator = setInterval(() => {
      if (storesToProcess.length === 0) {
        clearInterval(timeIterator)
        return
      }

      let key = createStorageKey(storesToProcess[0])
      let endState = transforms.reduce((subState, transformer) => transformer.in(subState), state[storesToProcess[0]])
      if (typeof endState !== 'undefined') storage.setItem(key, serialize(endState), warnIfSetError(key))
      storesToProcess.shift()
    }, debounce)

    lastState = state
  })

  function whitelistBlacklistCheck (key) {
    if (whitelist && whitelist.indexOf(key) === -1) return true
    if (blacklist.indexOf(key) !== -1) return true
    return false
  }

  function restoreKey (key, cb) {
    storage.getItem(createStorageKey(key), (err, serialized) => {
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

    if (state !== null && purgeMode !== '*') {
      if (!Array.isArray(purgeMode) || purgeMode.indexOf(key) === -1) store.dispatch(rehydrateAction(key, state))
    }
    cb && cb(null, state)
  }

  function rehydrationComplete () {
    store.dispatch(completeAction())
    genericSetImmediate(() => onComplete && onComplete(null, restoredState))
  }

  function purge (keys) {
    purgeMode = keys
    forEach(keys, (key) => {
      storage.removeItem(createStorageKey(key), warnIfRemoveError(key))
    })
  }

  function purgeAll () {
    purgeMode = '*'
    storage.getAllKeys((err, allKeys) => {
      if (err && process.env.NODE_ENV !== 'production') { console.warn('Error in storage.getAllKeys') }
      purge(allKeys.filter(key => key.indexOf(constants.keyPrefix) === 0).map(key => key.slice(constants.keyPrefix.length)))
    })
  }

  // return `persistor`
  return {
    rehydrate,
    purge,
    purgeAll
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
