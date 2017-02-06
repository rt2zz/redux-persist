'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = purgeStoredState;

var _constants = require('./constants');

var _promiseAdapter = require('./promiseAdapter');

var _promiseAdapter2 = _interopRequireDefault(_promiseAdapter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function purgeStoredState(config, keys) {
  var storage = config.storage;
  var keyPrefix = config.keyPrefix !== undefined ? config.keyPrefix : _constants.KEY_PREFIX;

  // basic validation
  if (Array.isArray(config)) throw new Error('redux-persist: purgeStoredState requires config as a first argument (found array). An array of keys is the optional second argument.');
  if (!storage) throw new Error('redux-persist: config.storage required in purgeStoredState');

  if (typeof keys === 'undefined') {
    // if keys is not defined, purge all keys
    var _makeAdapter = (0, _promiseAdapter2.default)(),
        callback = _makeAdapter.callback,
        promise = _makeAdapter.promise;

    var res = storage.getAllKeys(callback);

    if (res !== undefined && typeof res.then === 'function') {
      promise = res;
    }

    return promise.then(function (allKeys) {
      return purgeStoredState(config, allKeys.filter(function (key) {
        return key.indexOf(keyPrefix) === 0;
      }).map(function (key) {
        return key.slice(keyPrefix.length);
      }));
    });
  } else {
    // otherwise purge specified keys
    return Promise.all(keys.map(function (key) {
      var _makeAdapter2 = (0, _promiseAdapter2.default)(),
          callback = _makeAdapter2.callback,
          promise = _makeAdapter2.promise;

      var res = storage.removeItem('' + keyPrefix + key, callback);
      if (res !== undefined && typeof res.then === 'function') {
        return res;
      } else {
        return callback;
      }
    }));
  }
}