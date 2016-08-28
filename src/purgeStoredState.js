export function purgeStoredState (config, keys) {
  const storage = config.storage
  const keyPrefix = config.keyPrefix

  // basic validation
  if (Array.isArray(config)) throw new Error('redux-persist: purgeStoredState requires config as a first argument (found array). An array of keys is the optional second argument.')
  if (!storage) throw new Error('redux-persist: config.storage required in purgeStoredState')
  if (!keyPrefix) throw new Error('redux-persist: config.keyPrefix required in purgeStoredState')

  // if keys is not defined, purge all keys
  if (typeof keys === 'undefined') {
    storage.getAllKeys((err, allKeys) => {
      if (err && process.env.NODE_ENV !== 'production') { console.warn('redux-persist: error during purgeStoredState in storage.getAllKeys') }
      return purgeStoredState(config, allKeys.filter((key) => key.indexOf(keyPrefix) === 0).map((key) => key.slice(keyPrefix.length)))
    })
  }
  // otherwise purge specified keys
  else {
    return Promise.all(keys.map((key) => {
      return storage.removeItem(`${keyPrefix}${key}`, warnIfRemoveError(key))
    }))
  }
}
