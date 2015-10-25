import constants from '../../constants'
import { mapKeys } from 'lodash'

export default function createMemoryStorage (initialState) {
  let state = mapKeys(initialState, (value, key) => constants.keyPrefix + key)
  return {
    getItem: function (key, cb) {
      cb(null, state[key])
    },
    setItem: function (key, string, cb) {
      state = {...state, [key]: string}
      cb(null)
    },
    removeItem: function (key, cb) {
      state = {...state, [key]: undefined}
      cb(null)
    },
    getAllKeys: function (cb) {
      cb(null, Object.keys(state))
    }
  }
}
