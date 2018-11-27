var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

import getStoredStateV5 from '../getStoredState';

export default function getStoredState(v4Config) {
  return function (v5Config) {
    return getStoredStateV5(v5Config).then(function (state) {
      if (state) return state;else return getStoredStateV4(v4Config);
    });
  };
}

var KEY_PREFIX = 'reduxPersist:';

function hasLocalStorage() {
  if ((typeof self === 'undefined' ? 'undefined' : _typeof(self)) !== 'object' || !('localStorage' in self)) {
    return false;
  }

  try {
    var _storage = self.localStorage;
    var testKey = 'redux-persist localStorage test';
    _storage.setItem(testKey, 'test');
    _storage.getItem(testKey);
    _storage.removeItem(testKey);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn('redux-persist localStorage test failed, persistence will be disabled.');
    return false;
  }
  return true;
}

var noop = function noop() {
  /* noop */return null;
};
var noStorage = {
  getItem: noop,
  setItem: noop,
  removeItem: noop,
  getAllKeys: noop
};
var createAsyncLocalStorage = function createAsyncLocalStorage() {
  if (!hasLocalStorage()) return noStorage;
  var localStorage = self.localStorage;
  return {
    getAllKeys: function getAllKeys(cb) {
      try {
        var keys = [];
        for (var i = 0; i < localStorage.length; i++) {
          keys.push(localStorage.key(i));
        }
        cb(null, keys);
      } catch (e) {
        cb(e);
      }
    },
    getItem: function getItem(key, cb) {
      try {
        var s = localStorage.getItem(key);
        cb(null, s);
      } catch (e) {
        cb(e);
      }
    },
    setItem: function setItem(key, string, cb) {
      try {
        localStorage.setItem(key, string);
        cb(null);
      } catch (e) {
        cb(e);
      }
    },
    removeItem: function removeItem(key, cb) {
      try {
        localStorage.removeItem(key);
        cb && cb(null);
      } catch (e) {
        cb(e);
      }
    }
  };
};

function getStoredStateV4(v4Config) {
  return new Promise(function (resolve, reject) {
    var storage = v4Config.storage || createAsyncLocalStorage();
    var deserializer = v4Config.serialize === false ? function (data) {
      return data;
    } : function (serial) {
      return JSON.parse(serial);
    };
    var blacklist = v4Config.blacklist || [];
    var whitelist = v4Config.whitelist || false;
    var transforms = v4Config.transforms || [];
    var keyPrefix = v4Config.keyPrefix !== undefined ? v4Config.keyPrefix : KEY_PREFIX;

    // fallback getAllKeys to `keys` if present (LocalForage compatability)
    if (storage.keys && !storage.getAllKeys) storage = _extends({}, storage, { getAllKeys: storage.keys });

    var restoredState = {};
    var completionCount = 0;

    storage.getAllKeys(function (err) {
      var allKeys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      if (err) {
        if (process.env.NODE_ENV !== 'production') console.warn('redux-persist/getStoredState: Error in storage.getAllKeys');
        return reject(err);
      }

      var persistKeys = allKeys.filter(function (key) {
        return key.indexOf(keyPrefix) === 0;
      }).map(function (key) {
        return key.slice(keyPrefix.length);
      });
      var keysToRestore = persistKeys.filter(passWhitelistBlacklist);

      var restoreCount = keysToRestore.length;
      if (restoreCount === 0) resolve(undefined);
      keysToRestore.forEach(function (key) {
        storage.getItem(createStorageKey(key), function (err, serialized) {
          if (err && process.env.NODE_ENV !== 'production') console.warn('redux-persist/getStoredState: Error restoring data for key:', key, err);else restoredState[key] = rehydrate(key, serialized);
          completionCount += 1;
          if (completionCount === restoreCount) resolve(restoredState);
        });
      });
    });

    function rehydrate(key, serialized) {
      var state = null;

      try {
        var data = serialized ? deserializer(serialized) : undefined;
        state = transforms.reduceRight(function (subState, transformer) {
          return transformer.out(subState, key, {});
        }, data);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') console.warn('redux-persist/getStoredState: Error restoring data for key:', key, err);
      }

      return state;
    }

    function passWhitelistBlacklist(key) {
      if (whitelist && whitelist.indexOf(key) === -1) return false;
      if (blacklist.indexOf(key) !== -1) return false;
      return true;
    }

    function createStorageKey(key) {
      return '' + keyPrefix + key;
    }
  });
}

function defaultDeserializer(serial) {
  return JSON.parse(serial);
}