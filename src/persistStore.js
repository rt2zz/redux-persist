import forEach from 'lodash.foreach'
import * as constants from './constants'
import createAsyncLocalStorage from './defaults/asyncLocalStorage'
import getStoredState from './getStoredState'
import createPersistor from './createPersistor'

const genericSetImmediate = typeof setImmediate === 'undefined' ? global.setImmediate : setImmediate

export default function persistStore (store, config = {}, onComplete) {
  // defaults
  const deserialize = config.deserialize || defaultDeserialize
  let storage = config.storage || createAsyncLocalStorage('local')
  const shouldRestore = !config.skipRestore
  const transforms = config.transforms || []

  // fallback getAllKeys to `keys` if present (LocalForage compatability)
  if (storage.keys && !storage.getAllKeys) storage = {...storage, getAllKeys: storage.keys}

  // purge: stateful variable triggered via chained method for convienence
  let purgeMode = false

  // restore
  if (shouldRestore) {
    genericSetImmediate(() => {
      getStoredState({...config, purgeMode}, (err, restoredState) => {
        if (err && process.env.NODE_ENV !== 'production') console.warn('Error in getStoredState', err)
        store.dispatch(rehydrateAction(restoredState))
        complete(null, restoredState)
      })
    })
  } else genericSetImmediate(complete)

  function complete (err, restoredState) {
    createPersistor(store, config)
    onComplete && onComplete(err, restoredState)
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

function createStorageKey (key) {
  return constants.keyPrefix + key
}

function rehydrateAction (data) {
  return {
    type: constants.REHYDRATE,
    payload: data
  }
}

function defaultDeserialize (serial) {
  return JSON.parse(serial)
}
