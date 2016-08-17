const genericSetImmediate = typeof setImmediate === 'undefined' ? global.setImmediate : setImmediate
const nextTick = process && process.nextTick ? process.nextTick : genericSetImmediate

const noStorage = process && process.env && process.env.NODE_ENV === 'production'
  ? () => { /* noop */ return null }
  : () => {
    console.error('redux-persist asyncLocalStorage requires a global localStorage object. Either use a different storage backend or if this is a universal redux application you probably should conditionally persist like so: https://gist.github.com/rt2zz/ac9eb396793f95ff3c3b')
    return null
  }

function hasLocalStorage () {
  try {
    return typeof window === 'object' && !!window.localStorage
  } catch (e) { return false }
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
export default function (type) {
  let storage = getStorage(type)
  return {
    getItem: function (key, cb) {
      try {
        var s = storage.getItem(key)
        nextTick(() => {
          cb(null, s)
        })
      } catch (e) {
        cb(e)
      }
    },
    setItem: function (key, string, cb) {
      try {
        storage.setItem(key, string)
        nextTick(() => {
          cb(null)
        })
      } catch (e) {
        cb(e)
      }
    },
    removeItem: function (key, cb) {
      try {
        storage.removeItem(key)
        nextTick(() => {
          cb(null)
        })
      } catch (e) {
        cb(e)
      }
    },
    getAllKeys: function (cb) {
      try {
        var keys = []
        for (var i = 0; i < storage.length; i++) {
          keys.push(storage.key(i))
        }
        nextTick(() => {
          cb(null, keys)
        })
      } catch (e) {
        cb(e)
      }
    }
  }
}
