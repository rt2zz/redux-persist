// @flow

import type { PersistConfig } from './types'

import { KEY_PREFIX } from './constants'

export default function getStoredState(
  config: PersistConfig
): Promise<Object | void> {
  const transforms = config.transforms || []
  const storageKey = `${
    config.keyPrefix !== undefined ? config.keyPrefix : KEY_PREFIX
  }${config.key}`
  const storage = config.storage
  const debug = config.debug
  let deserialize
  if (config.deserialize === false) {
    deserialize = x => x
  } else if (typeof config.deserialize === 'function') {
    deserialize = config.deserialize
  } else {
    deserialize = defaultDeserialize
  }
  return storage.getItem(storageKey).then(serialized => {
    if (!serialized) return undefined
    else {
      try {
        let state = {}
        let rawState = deserialize(serialized)
        Object.keys(rawState).forEach(key => {
          state[key] = transforms.reduceRight((subState, transformer) => {
            return transformer.out(subState, key, rawState)
          }, deserialize(rawState[key]))
        })
        return state
      } catch (err) {
        if (process.env.NODE_ENV !== 'production' && debug)
          console.log(
            `redux-persist/getStoredState: Error restoring data ${serialized}`,
            err
          )
        throw err
      }
    }
  })
}

function defaultDeserialize(serial) {
  return JSON.parse(serial)
}
