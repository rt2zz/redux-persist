import { KEY_PREFIX, REHYDRATE } from './constants'
import createAsyncLocalStorage from './defaults/asyncLocalStorage'
import isStatePlainEnough from './utils/isStatePlainEnough'
import stringify from 'json-stringify-safe'
import { forEach } from 'lodash'

export default function createPersistor (store, config) {
  // defaults
  const serialize = config.serialize || defaultSerialize
  const deserialize = config.deserialize || defaultDeserialize
  const blacklist = config.blacklist || []
  const whitelist = config.whitelist || false
  const transforms = config.transforms || []
  const debounce = config.debounce || false
  const keyPrefix = config.keyPrefix || KEY_PREFIX
  let storage = config.storage || createAsyncLocalStorage('local')

  // fallback getAllKeys to `keys` if present (LocalForage compatability)
  if (storage.keys && !storage.getAllKeys) storage = {...storage, getAllKeys: storage.keys}

  // initialize stateful values
  let lastState = {}
  let paused = false
  let purgeMode = false
  let storesToProcess = []
  let timeIterator = null

  store.subscribe(() => {
    if (paused) return

    let state = store.getState()
    if (process.env.NODE_ENV !== 'production') {
      if (!isStatePlainEnough(state)) console.warn('redux-persist: State is not plain enough to persist. Can only persist plain objects.')
    }

    forEach(state, (subState, key) => {
      if (!passWhitelistBlacklist(key)) return
      if (lastState[key] === state[key]) return
      if (storesToProcess.indexOf(key) !== -1) return
      storesToProcess.push(key)
    })

    // time iterator (read: debounce)
    if (timeIterator === null) {
      timeIterator = setInterval(() => {
        if (storesToProcess.length === 0) {
          clearInterval(timeIterator)
          timeIterator = null
          return
        }

        let key = storesToProcess[0]
        let storageKey = createStorageKey(key)
        let endState = transforms.reduce((subState, transformer) => transformer.in(subState, key), store.getState()[storesToProcess[0]])
        if (typeof endState !== 'undefined') storage.setItem(storageKey, serialize(endState), warnIfSetError(key))
        storesToProcess.shift()
      }, debounce)
    }

    lastState = state
  })

  function passWhitelistBlacklist (key) {
    if (whitelist && whitelist.indexOf(key) === -1) return false
    if (blacklist.indexOf(key) !== -1) return false
    return true
  }

  function adhocRehydrate (incoming, options = {}) {
    let state = {}
    if (options.serial) {
      forEach(incoming, (subState, key) => {
        try {
          let data = deserialize(subState)
          state[key] = transforms.reduceRight((interState, transformer) => {
            return transformer.out(interState, key)
          }, data)
        } catch (err) {
          if (process.env.NODE_ENV !== 'production') console.warn(`Error rehydrating data for key "${key}"`, subState, err)
        }
      })
    } else state = incoming

    store.dispatch(rehydrateAction(state))
    return state
  }

  function purge (keys) {
    if (typeof keys === 'undefined') {
      purgeAll()
    } else {
      purgeMode = keys
      forEach(keys, (key) => {
        storage.removeItem(createStorageKey(key), warnIfRemoveError(key))
      })
    }
  }

  function purgeAll () {
    purgeMode = '*'
    storage.getAllKeys((err, allKeys) => {
      if (err && process.env.NODE_ENV !== 'production') { console.warn('Error in storage.getAllKeys') }
      purge(allKeys.filter((key) => key.indexOf(keyPrefix) === 0).map((key) => key.slice(keyPrefix.length)))
    })
  }

  function createStorageKey (key) {
    return `${keyPrefix}${key}`
  }

  // return `persistor`
  return {
    rehydrate: adhocRehydrate,
    pause: () => { paused = true },
    resume: () => { paused = false },
    purge,
    purgeAll,
    _getPurgeMode: () => purgeMode
  }
}

function warnIfRemoveError (key) {
  return function removeError (err) {
    if (err && process.env.NODE_ENV !== 'production') { console.warn('Error storing data for key:', key, err) }
  }
}

function warnIfSetError (key) {
  return function setError (err) {
    if (err && process.env.NODE_ENV !== 'production') { console.warn('Error storing data for key:', key, err) }
  }
}

function defaultSerialize (data) {
  return stringify(data, null, null, (k, v) => {
    if (process.env.NODE_ENV !== 'production') return null
    throw new Error(`
      redux-persist: cannot process cyclical state.
      Consider changing your state structure to have no cycles.
      Alternatively blacklist the corresponding reducer key.
      Cycle encounted at key "${k}" with value "${v}".
    `)
  })
}

function defaultDeserialize (serial) {
  return JSON.parse(serial)
}

function rehydrateAction (data) {
  return {
    type: REHYDRATE,
    payload: data
  }
}
