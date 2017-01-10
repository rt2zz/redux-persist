'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = function (type, config) {
  var deprecated = config && config.deprecated;
  var storage = getStorage(type);
  return {
    getAllKeys: function getAllKeys(cb) {
      // warn if deprecated
      if (deprecated) console.warn('redux-persist: ', deprecated);

      return new Promise(function (resolve, reject) {
        try {
          var keys = [];
          for (var i = 0; i < storage.length; i++) {
            keys.push(storage.key(i));
          }
          nextTick(function () {
            cb && cb(null, keys);
            resolve(keys);
          });
        } catch (e) {
          cb && cb(e);
          reject(e);
        }
      });
    },
    getItem: function getItem(key, cb) {
      return new Promise(function (resolve, reject) {
        try {
          var s = storage.getItem(key);
          nextTick(function () {
            cb && cb(null, s);
            resolve(s);
          });
        } catch (e) {
          cb && cb(e);
          reject(e);
        }
      });
    },
    setItem: function setItem(key, string, cb) {
      return new Promise(function (resolve, reject) {
        try {
          storage.setItem(key, string);
          nextTick(function () {
            cb && cb(null);
            resolve();
          });
        } catch (e) {
          cb && cb(e);
          reject(e);
        }
      });
    },
    removeItem: function removeItem(key, cb) {
      return new Promise(function (resolve, reject) {
        try {
          storage.removeItem(key);
          nextTick(function () {
            cb && cb(null);
            resolve();
          });
        } catch (e) {
          cb && cb(e);
          reject(e);
        }
      });
    }
  };
};

var genericSetImmediate = typeof setImmediate === 'undefined' ? global.setImmediate : setImmediate;
var nextTick = process && process.nextTick ? process.nextTick : genericSetImmediate;

var noStorage = process.env.NODE_ENV === 'production' ? function () {
  /* noop */return null;
} : function () {
  console.error('redux-persist asyncLocalStorage requires a global localStorage object. Either use a different storage backend or if this is a universal redux application you probably should conditionally persist like so: https://gist.github.com/rt2zz/ac9eb396793f95ff3c3b');
  return null;
};

function hasLocalStorage() {
  var storageExists = void 0;
  try {
    storageExists = (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && !!window.localStorage;
    if (storageExists) {
      var testKey = 'redux-persist localStorage test';
      // @TODO should we also test set and remove?
      window.localStorage.getItem(testKey);
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn('redux-persist localStorage getItem test failed, persistence will be disabled.');
    return false;
  }
  return storageExists;
}

function hasSessionStorage() {
  try {
    return (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && typeof window.sessionStorage !== 'undefined';
  } catch (e) {
    return false;
  }
}

function getStorage(type) {
  if (type === 'local') {
    return hasLocalStorage() ? window.localStorage : { getItem: noStorage, setItem: noStorage, removeItem: noStorage, getAllKeys: noStorage };
  }
  if (type === 'session') {
    return hasSessionStorage() ? window.sessionStorage : { getItem: noStorage, setItem: noStorage, removeItem: noStorage, getAllKeys: noStorage };
  }
}