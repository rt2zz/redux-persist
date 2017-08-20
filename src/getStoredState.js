// @flow

import type { PersistConfig, Transform } from './types'

import { KEY_PREFIX } from './constants'

export default function getStoredState(
  config: PersistConfig,
  onComplete: Function
) {
  const transforms = config.transforms || []
  const storageKey = `${config.keyPrefix !== undefined
    ? config.keyPrefix
    : KEY_PREFIX}${config.key}`
  const storage = config.storage
  const debug = config.debug

  let restoredState = {}
  let completionCount = 0

  storage.getItem(storageKey, (err, serialized) => {
    if (err) {
      if (process.env.NODE_ENV !== 'production' && debug)
        console.log('redux-persist/getStoredState: Error in storage.get', err)
      onComplete(err)
    }

    if (!serialized) onComplete(null, undefined)
    else {
      try {
        let state = {}
        let rawState = deserialize(serialized)
        Object.keys(rawState).forEach(key => {
          state[key] = transforms.reduceRight((subState, transformer) => {
            return transformer.out(subState, key)
          }, deserialize(rawState[key]))
        })
        onComplete(null, state)
      } catch (err) {
        if (process.env.NODE_ENV !== 'production' && debug)
          console.log(
            `redux-persist/getStoredState: Error restoring data ${serialized}`,
            err
          )
        onComplete(err)
      }
    }
  })

  return (
    !!Promise &&
    new Promise((resolve, reject) => {
      onComplete = (err, restoredState) => {
        if (err) reject(err)
        else resolve(restoredState)
      }
    })
  )
}

function deserialize(serial) {
  return JSON.parse(serial)
}
