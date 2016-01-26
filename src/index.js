module.exports.persistStore = require('./persistStore')
module.exports.autoRehydrate = require('./autoRehydrate')
module.exports.getStoredState = require('./getStoredState')
module.exports.storages = {
  asyncLocalStorage: require('./defaults/asyncLocalStorage'),
  asyncSessionStorage: require('./defaults/asyncSessionStorage')
}
