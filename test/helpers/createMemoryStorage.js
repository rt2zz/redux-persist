import { KEY_PREFIX } from '../../constants'
import { mapKeys, mapValues } from 'lodash'

export default function createMemoryStorage (initialState) {
  let state = mapValues(mapKeys(initialState, (value, key) => `${KEY_PREFIX}${key}`), (value) => JSON.stringify(value))
  return {
    getItem: function (key, cb) {
      setImmediate(() => {
        cb(null, state[key])
      })
    },
    setItem: function (key, string, cb) {
      state = {...state, [key]: string}
      setImmediate(() => {
        cb(null)
      })
    },
    removeItem: function (key, cb) {
      state = {...state, [key]: undefined}
      setImmediate(() => {
        cb(null)
      })
    },
    getAllKeys: function (cb) {
      setImmediate(() => {
        cb(null, Object.keys(state))
      })
    },
    _memory: true
  }
}
