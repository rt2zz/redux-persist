// @flow

import getStoredStateV5 from '../getStoredState'

import type { PersistConfig, Transform } from '../types'

type V4Config = {
  storage?: Object,
  serialize: boolean,
  keyPrefix?: string,
  transforms?: Array<Transform>,
  blacklist?: Array<string>,
  whitelist?: Array<string>,
}

export default function getStoredState(v4Config: V4Config) {
  return function(v5Config: PersistConfig) {
    return getStoredStateV5(v5Config).then(state => {
      if (state) return state
      else return getStoredStateV4(v4Config)
    })
  }
}

const KEY_PREFIX = 'reduxPersist:'

function hasLocalStorage() {
  if (typeof self !== 'object' || !('localStorage' in self)) {
    return false
  }

  try {
    let storage = self.localStorage
    const testKey = `redux-persist localStorage test`
    storage.setItem(testKey, 'test')
    storage.getItem(testKey)
    storage.removeItem(testKey)
  } catch (e) {
    if (process.env.NODE_ENV !== 'production')
      console.warn(
        `redux-persist localStorage test failed, persistence will be disabled.`
      )
    return false
  }
  return true
}

let noop = (...args: any) => {
  /* noop */ return null
}
const noStorage = {
  getItem: noop,
  setItem: noop,
  removeItem: noop,
  getAllKeys: noop,
}
const createAsyncLocalStorage = () => {
  if (!hasLocalStorage()) return noStorage
  let localStorage = self.localStorage
  return {
    getAllKeys: function(cb) {
      try {
        var keys = []
        for (var i = 0; i < localStorage.length; i++) {
          keys.push(localStorage.key(i))
        }
        cb(null, keys)
      } catch (e) {
        cb(e)
      }
    },
    getItem(key, cb) {
      try {
        var s = localStorage.getItem(key)
        cb(null, s)
      } catch (e) {
        cb(e)
      }
    },
    setItem(key, string, cb) {
      try {
        localStorage.setItem(key, string)
        cb(null)
      } catch (e) {
        cb(e)
      }
    },
    removeItem(key, cb) {
      try {
        localStorage.removeItem(key)
        cb && cb(null)
      } catch (e) {
        cb(e)
      }
    },
  }
}

function getStoredStateV4(v4Config: V4Config) {
  return new Promise((resolve, reject) => {
    let storage = v4Config.storage || createAsyncLocalStorage()
    const deserializer =
      v4Config.serialize === false
        ? data => data
        : (serial: string) => JSON.parse(serial)
    const blacklist = v4Config.blacklist || []
    const whitelist = v4Config.whitelist || false
    const transforms = v4Config.transforms || []
    const keyPrefix =
      v4Config.keyPrefix !== undefined ? v4Config.keyPrefix : KEY_PREFIX

    // fallback getAllKeys to `keys` if present (LocalForage compatability)
    if (storage.keys && !storage.getAllKeys)
      storage = { ...storage, getAllKeys: storage.keys }

    let restoredState = {}
    let completionCount = 0

    storage.getAllKeys((err, allKeys = []) => {
      if (err) {
        if (process.env.NODE_ENV !== 'production')
          console.warn(
            'redux-persist/getStoredState: Error in storage.getAllKeys'
          )
        return reject(err)
      }

      let persistKeys = allKeys
        .filter(key => key.indexOf(keyPrefix) === 0)
        .map(key => key.slice(keyPrefix.length))
      let keysToRestore = persistKeys.filter(passWhitelistBlacklist)

      let restoreCount = keysToRestore.length
      if (restoreCount === 0) resolve(undefined)
      keysToRestore.forEach(key => {
        storage.getItem(createStorageKey(key), (err, serialized) => {
          if (err && process.env.NODE_ENV !== 'production')
            console.warn(
              'redux-persist/getStoredState: Error restoring data for key:',
              key,
              err
            )
          else restoredState[key] = rehydrate(key, serialized)
          completionCount += 1
          if (completionCount === restoreCount) resolve(restoredState)
        })
      })
    })

    function rehydrate(key: string, serialized: ?string) {
      let state = null

      try {
        let data = serialized ? deserializer(serialized) : undefined
        state = transforms.reduceRight((subState, transformer) => {
          return transformer.out(subState, key, {})
        }, data)
      } catch (err) {
        if (process.env.NODE_ENV !== 'production')
          console.warn(
            'redux-persist/getStoredState: Error restoring data for key:',
            key,
            err
          )
      }

      return state
    }

    function passWhitelistBlacklist(key) {
      if (whitelist && whitelist.indexOf(key) === -1) return false
      if (blacklist.indexOf(key) !== -1) return false
      return true
    }

    function createStorageKey(key) {
      return `${keyPrefix}${key}`
    }
  })
}

function defaultDeserializer(serial: string) {
  return JSON.parse(serial)
}
