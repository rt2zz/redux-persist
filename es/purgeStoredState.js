

import { KEY_PREFIX } from './constants';

export default function purgeStoredState(config) {
  var storage = config.storage;
  var storageKey = '' + (config.keyPrefix !== undefined ? config.keyPrefix : KEY_PREFIX) + config.key;
  return storage.removeItem(storageKey, warnIfRemoveError);
}

function warnIfRemoveError(err) {
  if (err && process.env.NODE_ENV !== 'production') {
    console.error('redux-persist/purgeStoredState: Error purging data stored state', err);
  }
}