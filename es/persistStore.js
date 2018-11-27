var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

import { createStore } from 'redux';

import persistReducer from './persistReducer';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from './constants';

var initialState = {
  registry: [],
  bootstrapped: false
};

var persistorReducer = function persistorReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case REGISTER:
      return _extends({}, state, { registry: [].concat(_toConsumableArray(state.registry), [action.key]) });
    case REHYDRATE:
      var firstIndex = state.registry.indexOf(action.key);
      var registry = [].concat(_toConsumableArray(state.registry));
      registry.splice(firstIndex, 1);
      return _extends({}, state, { registry: registry, bootstrapped: registry.length === 0 });
    default:
      return state;
  }
};

export default function persistStore(store, options, cb) {
  // help catch incorrect usage of passing PersistConfig in as PersistorOptions
  if (process.env.NODE_ENV !== 'production') {
    var optionsToTest = options || {};
    var bannedKeys = ['blacklist', 'whitelist', 'transforms', 'storage', 'keyPrefix', 'migrate'];
    bannedKeys.forEach(function (k) {
      if (!!optionsToTest[k]) console.error('redux-persist: invalid option passed to persistStore: "' + k + '". You may be incorrectly passing persistConfig into persistStore, whereas it should be passed into persistReducer.');
    });
  }
  var boostrappedCb = cb || false;

  var _pStore = createStore(persistorReducer, initialState, options ? options.enhancer : undefined);
  var register = function register(key) {
    _pStore.dispatch({
      type: REGISTER,
      key: key
    });
  };

  var rehydrate = function rehydrate(key, payload, err) {
    var rehydrateAction = {
      type: REHYDRATE,
      payload: payload,
      err: err,
      key: key
      // dispatch to `store` to rehydrate and `persistor` to track result
    };store.dispatch(rehydrateAction);
    _pStore.dispatch(rehydrateAction);
    if (boostrappedCb && persistor.getState().bootstrapped) {
      boostrappedCb();
      boostrappedCb = false;
    }
  };

  var persistor = _extends({}, _pStore, {
    purge: function purge() {
      var results = [];
      store.dispatch({
        type: PURGE,
        result: function result(purgeResult) {
          results.push(purgeResult);
        }
      });
      return Promise.all(results);
    },
    flush: function flush() {
      var results = [];
      store.dispatch({
        type: FLUSH,
        result: function result(flushResult) {
          results.push(flushResult);
        }
      });
      return Promise.all(results);
    },
    pause: function pause() {
      store.dispatch({
        type: PAUSE
      });
    },
    persist: function persist() {
      store.dispatch({ type: PERSIST, register: register, rehydrate: rehydrate });
    }
  });

  persistor.persist();

  return persistor;
}