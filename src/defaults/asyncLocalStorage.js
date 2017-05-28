import setImmediate from '../utils/setImmediate'

let noStorage = () => { /* noop */ return null }
if (process.env.NODE_ENV !== 'production') {
  noStorage = () => {
    console.error('redux-persist asyncLocalStorage requires a global localStorage object. Either use a different storage backend or if this is a universal redux application you probably should conditionally persist like so: https://gist.github.com/rt2zz/ac9eb396793f95ff3c3b')
    return null
  }
}

function _hasStorage (storageType) {
  if (typeof window !== 'object' || !(storageType in window)) {
    return false
  }

  try {
    let storage = window[storageType]
    const testKey = `redux-persist ${storageType} test`
    storage.setItem(testKey, 'test')
    storage.getItem(testKey)
    storage.removeItem(testKey)
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn(`redux-persist ${storageType} test failed, persistence will be disabled.`)
    return false
  }
  return true
}

function hasLocalStorage () {
  return _hasStorage('localStorage')
}

function hasSessionStorage () {
  return _hasStorage('sessionStorage')
}

function getStorage (type) {
  if (type === 'local') {
    return hasLocalStorage()
      ? window.localStorage
      : { getItem: noStorage, setItem: noStorage, removeItem: noStorage, getAllKeys: noStorage }
  }
  if (type === 'session') {
    return hasSessionStorage()
      ? window.sessionStorage
      : { getItem: noStorage, setItem: noStorage, removeItem: noStorage, getAllKeys: noStorage }
  }
}

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
