import { KEY_PREFIX } from './constants'
import makeAdapter from './promiseAdapter';

export default function purgeStoredState (config, keys) {
  const storage = config.storage
  const keyPrefix = config.keyPrefix !== undefined ? config.keyPrefix : KEY_PREFIX

  // basic validation
  if (Array.isArray(config)) throw new Error('redux-persist: purgeStoredState requires config as a first argument (found array). An array of keys is the optional second argument.')
  if (!storage) throw new Error('redux-persist: config.storage required in purgeStoredState')

  if (typeof keys === 'undefined') { // if keys is not defined, purge all keys
    let { callback, promise } = makeAdapter()
    let res = storage.getAllKeys(callback);

    if ((res !== undefined) && (typeof(res.then) === 'function')) {
      promise = res;
    }

    return promise
    .then((allKeys) => {
      return purgeStoredState(config, allKeys.filter((key) => key.indexOf(keyPrefix) === 0).map((key) => key.slice(keyPrefix.length)))
    })
  } else { // otherwise purge specified keys
    return Promise.all(keys.map((key) => {
      let { callback, promise } = makeAdapter()
      let res = storage.removeItem(`${keyPrefix}${key}`, callback)
      if ((res !== undefined) && (typeof(res.then) === 'function')) {
        return res
      } else {
        return callback
      }
    }))
  }
}
