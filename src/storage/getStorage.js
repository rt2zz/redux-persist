// @flow

import type { Storage } from '../types'

function noop() {}
let noopStorage = {
  getItem: noop,
  setItem: noop,
  removeItem: noop,
}

function hasStorage(storageType) {
  if (typeof self !== 'object' || !(storageType in self)) {
    return false
  }

  try {
    let storage = self[storageType]
    const testKey = `redux-persist ${storageType} test`
    storage.setItem(testKey, 'test')
    storage.getItem(testKey)
    storage.removeItem(testKey)
  } catch (e) {
    if (process.env.NODE_ENV !== 'production')
      console.warn(
        `redux-persist ${storageType} test failed, persistence will be disabled.`
      )
    return false
  }
  return true
}

export default function getStorage(type: string): Storage {
  const storageType = `${type}Storage`
  if (hasStorage(storageType)) return self[storageType]
  else {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `redux-persist failed to create sync storage. falling back to noop storage.`
      )
    }
    return noopStorage
  }
}
