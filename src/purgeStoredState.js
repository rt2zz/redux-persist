// @flow

import type { PersistConfig } from './types'

import { KEY_PREFIX } from './constants'

export default function purgeStoredState(config: PersistConfig) {
  const storage = config.storage
  const storageKey = `${config.keyPrefix !== undefined
    ? config.keyPrefix
    : KEY_PREFIX}${config.key}`

  if (!storage)
    throw new Error(
      'redux-persist: config.storage required in purgeStoredState'
    )

  return storage.removeItem(storageKey, warnIfRemoveError)
}

function warnIfRemoveError(err) {
  if (err && process.env.NODE_ENV !== 'production') {
    console.warn('Error purging data stored state', err)
  }
}
