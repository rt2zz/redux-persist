import forEach from 'lodash.foreach'
import * as constants from './constants'
import createAsyncLocalStorage from './defaults/asyncLocalStorage'
import getStoredState from './getStoredState'
import stringify from 'json-stringify-safe'

const genericSetImmediate = typeof setImmediate === 'undefined' ? global.setImmediate : setImmediate

export default function persistStore (store, config = {}, onComplete) {
  // defaults
  const blacklist = config.blacklist || []
  const whitelist = config.whitelist || false
  const serialize = config.serialize || defaultSerialize
  const deserialize = config.deserialize || defaultDeserialize
  const transforms = config.transforms || []
  let storage = config.storage || createAsyncLocalStorage('local')
  const debounce = config.debounce || false
  const shouldRestore = !config.skipRestore

  // fallback getAllKeys to `keys` if present (LocalForage compatability)
  if (storage.keys && !storage.getAllKeys) storage = {...storage, getAllKeys: storage.keys}

  // initialize values
  let timeIterator = null
  let lastState = store.getState()
  let purgeMode = false
  let storesToProcess = []

  // restore
  if (shouldRestore) {
    genericSetImmediate(() => {
      getStoredState({...config, purgeMode}, (err, restoredState) => {
        if (err && process.env.NODE_ENV !== 'production') console.warn('Error in getStoredState', err)
        store.dispatch(rehydrateAction(restoredState))
        onComplete && onComplete(null, restoredState)
      })
    })
  } else onComplete && genericSetImmediate(onComplete)

  // store
  store.subscribe(() => {
    let state = store.getState()
    forEach(state, (subState, key) => {
      if (whitelistBlacklistCheck(key)) return
      if (lastState[key] === state[key]) return
      if (storesToProcess.indexOf(key) !== -1) return
      storesToProcess.push(key)
    })

    // time iterator (read: debounce)
    if (timeIterator === null) {
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
    }

    lastState = state
  })

  function whitelistBlacklistCheck (key) {
    if (whitelist && whitelist.indexOf(key) === -1) return true
    if (blacklist.indexOf(key) !== -1) return true
    return false
  }

  function adhocRehydrate (serialized, cb) {
    let state = null

    try {
      let data = deserialize(serialized)
      state = transforms.reduceRight((interState, transformer) => {
        return transformer.out(interState)
      }, data)
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.warn('Error rehydrating data:', serialized, err)
    }

    store.dispatch(rehydrateAction(state))
    cb && cb(null, state)
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
      purge(allKeys.filter((key) => key.indexOf(constants.keyPrefix) === 0).map((key) => key.slice(constants.keyPrefix.length)))
    })
  }

  // return `persistor`
  return {
    rehydrate: adhocRehydrate,
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

function rehydrateAction (data) {
  return {
    type: constants.REHYDRATE,
    payload: data
  }
}

function defaultSerialize (data) {
  return stringify(data, null, null, (k, v) => {
    if (process.env.NODE_ENV !== 'production') return null
    throw new Error(`
      redux-persist: cannot process cyclical state.
      Consider changing your state structure to have no cycles.
      Alternatively blacklist the corresponding reducer key.
      Cycle encounted at key "${k}" with value "${v}".
    `)
  })
}

function defaultDeserialize (serial) {
  return JSON.parse(serial)
}
