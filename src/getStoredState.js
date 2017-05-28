import { KEY_PREFIX } from './constants'
import createAsyncLocalStorage from './defaults/asyncLocalStorage'

export default function getStoredState (config, onComplete) {
  let storage = config.storage || createAsyncLocalStorage('local')
  const deserializer = config.serialize === false ? (data) => data : defaultDeserializer
  const blacklist = config.blacklist || []
  const whitelist = config.whitelist || false
  const transforms = config.transforms || []
  const keyPrefix = config.keyPrefix !== undefined ? config.keyPrefix : KEY_PREFIX

  // fallback getAllKeys to `keys` if present (LocalForage compatability)
  if (storage.keys && !storage.getAllKeys) storage = {...storage, getAllKeys: storage.keys}

  let restoredState = {}
  let completionCount = 0

  storage.getAllKeys((err, allKeys) => {
    if (err) {
      if (process.env.NODE_ENV !== 'production') console.warn('redux-persist/getStoredState: Error in storage.getAllKeys')
      complete(err)
    }

    let persistKeys = allKeys.filter((key) => key.indexOf(keyPrefix) === 0).map((key) => key.slice(keyPrefix.length))
    let keysToRestore = persistKeys.filter(passWhitelistBlacklist)

    let restoreCount = keysToRestore.length
    if (restoreCount === 0) complete(null, restoredState)
    keysToRestore.forEach((key) => {
      storage.getItem(createStorageKey(key), (err, serialized) => {
        if (err && process.env.NODE_ENV !== 'production') console.warn('redux-persist/getStoredState: Error restoring data for key:', key, err)
        else restoredState[key] = rehydrate(key, serialized)
        completionCount += 1
        if (completionCount === restoreCount) complete(null, restoredState)
      })
    })
  })

  function rehydrate (key, serialized) {
    let state = null

    try {
      let data = deserializer(serialized)
      state = transforms.reduceRight((subState, transformer) => {
        return transformer.out(subState, key)
      }, data)
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.warn('redux-persist/getStoredState: Error restoring data for key:', key, err)
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

  function createStorageKey (key) {
    return `${keyPrefix}${key}`
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

function defaultDeserializer (serial) {
  return JSON.parse(serial)
}
