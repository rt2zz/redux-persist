import setImmediate from '../utils/setImmediate'
import getStorage from './getStorage'

export default function (type, config) {
  let storage = getStorage(type)
  return {
    getAllKeys: function (cb) {
      return new Promise((resolve, reject) => {
        try {
          var keys = []
          for (var i = 0; i < storage.length; i++) {
            keys.push(storage.key(i))
          }
          setImmediate(() => {
            cb && cb(null, keys)
            resolve(keys)
          })
        } catch (e) {
          cb && cb(e)
          reject(e)
        }
      })
    },
    getItem (key, cb) {
      return new Promise((resolve, reject) => {
        try {
          var s = storage.getItem(key)
          setImmediate(() => {
            cb && cb(null, s)
            resolve(s)
          })
        } catch (e) {
          cb && cb(e)
          reject(e)
        }
      })
    },
    setItem (key, string, cb) {
      return new Promise((resolve, reject) => {
        try {
          storage.setItem(key, string)
          setImmediate(() => {
            cb && cb(null)
            resolve()
          })
        } catch (e) {
          cb && cb(e)
          reject(e)
        }
      })
    },
    removeItem (key, cb) {
      return new Promise((resolve, reject) => {
        try {
          storage.removeItem(key)
          setImmediate(() => {
            cb && cb(null)
            resolve()
          })
        } catch (e) {
          cb && cb(e)
          reject(e)
        }
      })
    }
  }
}
