import forEach from 'lodash.foreach'
import constants from './constants'
import defaultStorage from './defaults/asyncLocalStorage'

export default function getStoredState (config, onComplete) {
  const storage = config.storage || defaultStorage
  const deserialize = config.deserialize || defaultDeserialize
  const transforms = config.transforms || []

  let restoredState = {}
  let completionCount = 0

  storage.getAllKeys((err, allKeys) => {
    if (err && process.env.NODE_ENV !== 'production') { console.warn('Error in storage.getAllKeys') }
    let persistKeys = allKeys.filter(key => key.indexOf(constants.keyPrefix) === 0).map(key => key.slice(constants.keyPrefix.length))
    let restoreCount = persistKeys.length

    if (restoreCount === 0) complete(null, restoredState)
    forEach(persistKeys, (key) => {
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
        return transformer.out(subState)
      }, data)
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.warn('Error restoring data for key:', key, err)
    }

    return state
  }

  function complete (err, restoredState) {
    onComplete(err, restoredState)
  }
}

function defaultDeserialize (serial) {
  return JSON.parse(serial)
}

function createStorageKey (key) {
  return constants.keyPrefix + key
}
