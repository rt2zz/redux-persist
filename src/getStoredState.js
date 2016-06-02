import { forEach } from 'lodash'
import * as constants from './constants'
import createAsyncLocalStorage from './defaults/asyncLocalStorage'

export default function getStoredState (config, onComplete) {
  let storage = config.storage || createAsyncLocalStorage('local')
  const deserialize = config.deserialize || defaultDeserialize
  const blacklist = config.blacklist || []
  const whitelist = config.whitelist || false
  const transforms = config.transforms || []
  const purgeMode = config.purgeMode || false

  // fallback getAllKeys to `keys` if present (LocalForage compatability)
  if (storage.keys && !storage.getAllKeys) storage = {...storage, getAllKeys: storage.keys}

  let restoredState = {}
  let completionCount = 0

  storage.getAllKeys((err, allKeys) => {
    if (err && process.env.NODE_ENV !== 'production') { console.warn('Error in storage.getAllKeys') }
    let persistKeys = allKeys.filter((key) => key.indexOf(constants.keyPrefix) === 0).map((key) => key.slice(constants.keyPrefix.length))
    let filteredPersistKeys = persistKeys.filter(passWhitelistBlacklist)
    let keysToRestore = Array.isArray(purgeMode)
      ? filteredPersistKeys.filter((key) => purgeMode.indexOf(key) === -1)
      : purgeMode === '*' ? [] : filteredPersistKeys

    let restoreCount = keysToRestore.length
    if (restoreCount === 0) complete(null, restoredState)
    forEach(keysToRestore, (key) => {
      storage.getItem(createStorageKey(key), (err, serialized) => {
        if (err && process.env.NODE_ENV !== 'production') console.warn('Error restoring data for key:', key, err)
        else restoredState[key] = rehydrate(key, serialized)
        completionCount += 1
        if (completionCount === restoreCount) complete(null, restoredState)
      })
    })
  })

  function rehydrate (key, serialized) {
    let state = null

    try {
      let data = deserialize(serialized)
      state = transforms.reduceRight((subState, transformer) => {
        return transformer.out(subState, key)
      }, data)
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.warn('Error restoring data for key:', key, err)
    }

    return state
  }

  function complete (err, restoredState) {
    onComplete(err, restoredState)
  }

  function passWhitelistBlacklist (key) {
    if (whitelist && whitelist.indexOf(key) === -1) return false
    if (blacklist.indexOf(key) !== -1) return false
    return true
  }

  if (typeof onComplete !== 'function' && !!Promise) {
    return new Promise((resolve, reject) => {
      onComplete = (err, restoredState) => {
        if (err) reject(err)
        else resolve(restoredState)
      }
    })
  }
}

function defaultDeserialize (serial) {
  return JSON.parse(serial)
}

function createStorageKey (key) {
  return constants.keyPrefix + key
}
