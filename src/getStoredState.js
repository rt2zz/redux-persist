// @flow

import type { PersistConfig } from './types'

import { KEY_PREFIX } from './constants'

export default function getStoredState(
  config: PersistConfig
): Promise<Object | void> {
  const transforms = config.transforms || []
  const storageKey = `${config.keyPrefix !== undefined
    ? config.keyPrefix
    : KEY_PREFIX}${config.key}`
  const storage = config.storage
  const debug = config.debug

  return storage.getItem(storageKey).then(serialized => {
    if (!serialized) return undefined
    else {
      try {
        let state = {}
        let rawState = deserialize(serialized)
        Object.keys(rawState).forEach(key => {
          state[key] = transforms.reduceRight((subState, transformer) => {
            return transformer.out(subState, key)
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

function deserialize(serial) {
  return JSON.parse(serial)
}
