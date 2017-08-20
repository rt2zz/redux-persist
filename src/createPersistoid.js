// @flow

import { KEY_PREFIX, REHYDRATE } from './constants'

import type { Persistoid, PersistConfig, Transform } from './types'

export default function createPersistoid(config: PersistConfig): Persistoid {
  // defaults
  const blacklist: ?Array<string> = config.blacklist || null
  const whitelist: ?Array<string> = config.whitelist || null
  const transforms = config.transforms || []
  const throttle = config.throttle || 0
  const storageKey = `${config.keyPrefix !== undefined
    ? config.keyPrefix
    : KEY_PREFIX}${config.key}`

  const storage = config.storage

  // initialize stateful values
  let lastState = {}
  let keysToProcess = []
  let timeIterator: ?number = null

  const update = (state: Object) => {
    Object.keys(state).forEach(key => {
      let subState = state[key]
      if (!passWhitelistBlacklist(key)) return // is keyspace ignored? noop
      if (lastState[key] === state[key]) return // value unchanged? noop
      if (keysToProcess.indexOf(key) !== -1) return // is key already queued? noop
      keysToProcess.push(key) // add key to queue
    })

    // time iterator (read: throttle)
    if (timeIterator === null) {
      timeIterator = setInterval(() => {
        if (keysToProcess.length === 0) {
          if (timeIterator) clearInterval(timeIterator)
          timeIterator = null
          return
        }

        let key = keysToProcess.shift()
        let endState = transforms.reduce((subState, transformer) => {
          return transformer.in(subState, key)
        }, lastState[key])
        if (typeof endState !== 'undefined') stagedWrite(key, endState)
      }, throttle)
    }

    lastState = state
  }

  let stagedState = {}
  function stagedWrite(key: string, endState: any) {
    try {
      stagedState[key] = serialize(endState)
    } catch (err) {
      console.error(
        'redux-persist/createPersistoid: error serializing state',
        err
      )
    }
    if (keysToProcess.length === 0) {
      storage.setItem(storageKey, serialize(stagedState), onWriteFail)
    }
  }

  function passWhitelistBlacklist(key) {
    if (whitelist && whitelist.indexOf(key) === -1) return false
    if (blacklist && blacklist.indexOf(key) !== -1) return false
    return true
  }

  function onWriteFail() {
    return function setError(err) {
      // @TODO add fail handlers (typically storage full)
      if (err && process.env.NODE_ENV !== 'production') {
        console.error('Error storing data', err)
      }
    }
  }

  // return `persistoid`
  return {
    update,
  }
}

// @NOTE in the future this may be exposed via config
function serialize(data) {
  return JSON.stringify(data)
}
