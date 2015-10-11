var nextTick = process && process.nextTick ? process.nextTick : setImmediate

export default {
  getItem: function (key, cb) {
    try {
      var s = localStorage.getItem(key)
      nextTick(() => {
        cb(null, s)
      })
    } catch (e) {
      cb(e)
    }
  },
  setItem: function (key, string, cb) {
    try {
      localStorage.setItem(key, string)
      nextTick(() => {
        cb(null)
      })
    } catch (e) {
      cb(e)
    }
  },
  removeItem: function (key, cb) {
    try {
      localStorage.removeItem(key)
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
      for (var i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i))
      }
      nextTick(() => {
        cb(null, keys)
      })
    } catch (e) {
      cb(e)
    }
  }
}
