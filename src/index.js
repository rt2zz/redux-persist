const createAsyncLocalStorage = require('./defaults/asyncLocalStorage')

module.exports.persistStore = require('./persistStore')
module.exports.autoRehydrate = require('./autoRehydrate')
module.exports.getStoredState = require('./getStoredState')
module.exports.storages = {
  asyncLocalStorage: createAsyncLocalStorage('local'),
  asyncSessionStorage: createAsyncLocalStorage('session')
}
