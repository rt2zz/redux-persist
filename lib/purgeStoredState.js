'use strict';

exports.__esModule = true;
exports.default = purgeStoredState;

var _constants = require('./constants');

function purgeStoredState(config) {
  var storage = config.storage;
  var storageKey = '' + (config.keyPrefix !== undefined ? config.keyPrefix : _constants.KEY_PREFIX) + config.key;
  return storage.removeItem(storageKey, warnIfRemoveError);
}

function warnIfRemoveError(err) {
  if (err && process.env.NODE_ENV !== 'production') {
    console.error('redux-persist/purgeStoredState: Error purging data stored state', err);
  }
}