const genericSetImmediate = typeof setImmediate === 'undefined' ? global.setImmediate : setImmediate
const nextTick = process && process.nextTick ? process.nextTick : genericSetImmediate

const noStorage = process.env.NODE_ENV === 'production'
  ? () => { /* noop */ return null }
  : () => {
    console.error('redux-persist asyncLocalStorage requires a global localStorage object. Either use a different storage backend or if this is a universal redux application you probably should conditionally persist like so: https://gist.github.com/rt2zz/ac9eb396793f95ff3c3b')
    return null
  }

function hasLocalStorage () {
  let storageExists
  try {
    storageExists = (typeof window === 'object' && !!window.localStorage)
    if (storageExists) {
      const testKey = 'redux-persist localStorage test'
      // @TODO should we also test set and remove?
      window.localStorage.getItem(testKey)
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn('redux-persist localStorage getItem test failed, persistence will be disabled.')
    return false
  }
  return storageExists
}

function hasSessionStorage () {
  try {
    return typeof window === 'object' && typeof window.sessionStorage !== 'undefined'
  } catch (e) { return false }
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
  const deprecated = config && config.deprecated
  let storage = getStorage(type)
  return {
    getAllKeys: function (cb) {
      // warn if deprecated
      if (deprecated) console.warn('redux-persist: ', deprecated)

      return new Promise((resolve, reject) => {
        try {
          var keys = []
          for (var i = 0; i < storage.length; i++) {
            keys.push(storage.key(i))
          }
          nextTick(() => {
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
          nextTick(() => {
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
          nextTick(() => {
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
          nextTick(() => {
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
