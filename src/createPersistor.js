import forEach from 'lodash.foreach'
import * as constants from './constants'
import createAsyncLocalStorage from './defaults/asyncLocalStorage'
import stringify from 'json-stringify-safe'

export default function createPersistor (store, config) {
  // defaults
  const serialize = config.serialize || defaultSerialize
  const blacklist = config.blacklist || []
  const whitelist = config.whitelist || false
  const transforms = config.transforms || []
  const debounce = config.debounce || false
  let storage = config.storage || createAsyncLocalStorage('local')

  // fallback getAllKeys to `keys` if present (LocalForage compatability)
  if (storage.keys && !storage.getAllKeys) storage = {...storage, getAllKeys: storage.keys}

  // initialize stateful values
  let storesToProcess = []
  let timeIterator = null
  let lastState = store.getState()

  store.subscribe(() => {
    let state = store.getState()
    forEach(state, (subState, key) => {
      if (whitelistBlacklistCheck(key)) return
      if (lastState[key] === state[key]) return
      if (storesToProcess.indexOf(key) !== -1) return
      storesToProcess.push(key)
    })

    // time iterator (read: debounce)
    if (timeIterator === null) {
      timeIterator = setInterval(() => {
        if (storesToProcess.length === 0) {
          clearInterval(timeIterator)
          return
        }

        let key = createStorageKey(storesToProcess[0])
        let endState = transforms.reduce((subState, transformer) => transformer.in(subState), state[storesToProcess[0]])
        if (typeof endState !== 'undefined') storage.setItem(key, serialize(endState), warnIfSetError(key))
        storesToProcess.shift()
      }, debounce)
    }

    lastState = state
  })

  function whitelistBlacklistCheck (key) {
    if (whitelist && whitelist.indexOf(key) === -1) return true
    if (blacklist.indexOf(key) !== -1) return true
    return false
  }
}

function warnIfSetError (key) {
  return function setError (err) {
    if (err && process.env.NODE_ENV !== 'production') { console.warn('Error storing data for key:', key, err) }
  }
}

function createStorageKey (key) {
  return constants.keyPrefix + key
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
