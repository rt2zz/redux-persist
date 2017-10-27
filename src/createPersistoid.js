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
  let stagedState = {}
  let keysToProcess = []
  let timeIterator: ?number = null
  let writePromise = null

  const update = (state: Object) => {
    // add any changed keys to the queue
    Object.keys(state).forEach(key => {
      let subState = state[key]
      if (!passWhitelistBlacklist(key)) return // is keyspace ignored? noop
      if (lastState[key] === state[key]) return // value unchanged? noop
      if (keysToProcess.indexOf(key) !== -1) return // is key already queued? noop
      keysToProcess.push(key) // add key to queue
    })

    // start the time iterator if not running (read: throttle)
    if (timeIterator === null) {
      timeIterator = setInterval(processNextKey, throttle)
    }

    lastState = state
  }

  function processNextKey() {
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
  }

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
      // cleanup any removed keys just before write.
      Object.keys(stagedState).forEach(key => {
        if (lastState[key] === undefined) {
          delete stagedState[key]
        }
      })

      writePromise = storage
        .setItem(storageKey, serialize(stagedState))
        .catch(onWriteFail)
    }
  }

  function passWhitelistBlacklist(key) {
    if (whitelist && whitelist.indexOf(key) === -1) return false
    if (blacklist && blacklist.indexOf(key) !== -1) return false
    return true
  }

  function onWriteFail(err) {
    // @TODO add fail handlers (typically storage full)
    if (err && process.env.NODE_ENV !== 'production') {
      console.error('Error storing data', err)
    }
  }

  const flush = () => {
    while (keysToProcess.length !== 0) {
      processNextKey()
    }
    return writePromise || Promise.resolve()
  }

  // return `persistoid`
  return {
    update,
    flush,
  }
}

// @NOTE in the future this may be exposed via config
function serialize(data) {
  return JSON.stringify(data)
}
