/* eslint-disable @typescript-eslint/no-explicit-any */
import { KEY_PREFIX } from './constants'

import type { Persistoid, PersistConfig } from './types'
import { KeyAccessState } from './types'

export default function createPersistoid(config: PersistConfig<any>): Persistoid {
  // defaults
  const denylist: string[] | null = config.denylist || null
  const allowlist: string[] | null = config.allowlist || null
  const transforms = config.transforms || []
  const throttle = config.throttle || 0
  const storageKey = `${
    config.keyPrefix !== undefined ? config.keyPrefix : KEY_PREFIX
  }${config.key}`
  const storage = config.storage
  let serialize: (x: any) => any
  if (config.serialize === false) {
    serialize = (x: any) => x
  } else if (typeof config.serialize === 'function') {
    serialize = config.serialize
  } else {
    serialize = defaultSerialize
  }
  const writeFailHandler = config.writeFailHandler || null

  // initialize stateful values
  let lastState: KeyAccessState = {}
  const stagedState: KeyAccessState = {}
  const keysToProcess: string[] = []
  let timeIterator: any = null
  let writePromise: Promise<any> | null = null

  const update = (state: KeyAccessState) => {
    // add any changed keys to the queue
    Object.keys(state).forEach(key => {
      if (!passAllowlistDenylist(key)) return // is keyspace ignored? noop
      if (lastState[key] === state[key]) return // value unchanged? noop
      if (keysToProcess.indexOf(key) !== -1) return // is key already queued? noop
      keysToProcess.push(key) // add key to queue
    })

    //if any key is missing in the new state which was present in the lastState,
    //add it for processing too
    Object.keys(lastState).forEach(key => {
      if (
        state[key] === undefined &&
        passAllowlistDenylist(key) &&
        keysToProcess.indexOf(key) === -1 &&
        lastState[key] !== undefined
      ) {
        keysToProcess.push(key)
      }
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

    const key: any = keysToProcess.shift()
    if (key === undefined) {
      return
    }
    const endState = transforms.reduce((subState, transformer) => {
      return transformer.in(subState, key, lastState)
    }, lastState[key])

    if (endState !== undefined) {
      try {
        stagedState[key] = serialize(endState)
      } catch (err) {
        console.error(
          'redux-persist/createPersistoid: error serializing state',
          err
        )
      }
    } else {
      //if the endState is undefined, no need to persist the existing serialized content
      delete stagedState[key]
    }

    if (keysToProcess.length === 0) {
      writeStagedState()
    }
  }

  function writeStagedState() {
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

  function passAllowlistDenylist(key: string) {
    if (allowlist && allowlist.indexOf(key) === -1 && key !== '_persist')
      return false
    if (denylist && denylist.indexOf(key) !== -1) return false
    return true
  }

  function onWriteFail(err: any) {
    // @TODO add fail handlers (typically storage full)
    if (writeFailHandler) writeFailHandler(err)
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
function defaultSerialize(data: any) {
  return JSON.stringify(data)
}
