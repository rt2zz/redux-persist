// @flow

import type { PersistConfig, Transform } from './types'

import { KEY_PREFIX } from './constants'

export function getStoredState(config: PersistConfig, onComplete: Function) {
  const transforms = config.transforms || []
  const storageKey = `${config.keyPrefix !== undefined
    ? config.keyPrefix
    : KEY_PREFIX}${config.key}`

  // storage with keys -> getAllKeys for localForage support
  let storage = config.storage

  let restoredState = {}
  let completionCount = 0

  storage.getItem(storageKey, (err, serialized) => {
    if (err) {
      if (process.env.NODE_ENV !== 'production')
        console.warn('redux-p/getStoredState: Error in storage.get')
      onComplete(err)
    }

    if (!serialized) onComplete(null, null)
    else {
      try {
        let state = {}
        let rawState = deserializer(serialized)
        Object.keys(rawState).forEach(key => {
          state[key] = transforms.reduceRight((subState, transformer) => {
            return transformer.out(subState, key)
          }, deserializer(rawState[key]))
        })
        onComplete(null, state)
      } catch (err) {
        if (process.env.NODE_ENV !== 'production')
          console.error(
            `redux-persist/getStoredState: Error restoring data ${serialized}`,
            err
          )
        onComplete(err)
      }
    }
  })

  if (typeof onComplete !== 'function' && !!Promise) {
    return new Promise((resolve, reject) => {
      onComplete = (err, restoredState) => {
        if (err) reject(err)
        else resolve(restoredState)
      }
    })
  }
}

function deserializer(serial) {
  return JSON.parse(serial)
}
