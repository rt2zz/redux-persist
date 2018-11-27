var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import { FLUSH, PAUSE, PERSIST, PURGE, REHYDRATE, DEFAULT_VERSION } from './constants';

import autoMergeLevel1 from './stateReconciler/autoMergeLevel1';
import createPersistoid from './createPersistoid';
import defaultGetStoredState from './getStoredState';
import purgeStoredState from './purgeStoredState';

var DEFAULT_TIMEOUT = 5000;
/*
  @TODO add validation / handling for:
  - persisting a reducer which has nested _persist
  - handling actions that fire before reydrate is called
*/
export default function persistReducer(config, baseReducer) {
  if (process.env.NODE_ENV !== 'production') {
    if (!config) throw new Error('config is required for persistReducer');
    if (!config.key) throw new Error('key is required in persistor config');
    if (!config.storage) throw new Error("redux-persist: config.storage is required. Try using one of the provided storage engines `import storage from 'redux-persist/lib/storage'`");
  }

  var version = config.version !== undefined ? config.version : DEFAULT_VERSION;
  var debug = config.debug || false;
  var stateReconciler = config.stateReconciler === undefined ? autoMergeLevel1 : config.stateReconciler;
  var getStoredState = config.getStoredState || defaultGetStoredState;
  var timeout = config.timeout !== undefined ? config.timeout : DEFAULT_TIMEOUT;
  var _persistoid = null;
  var _purge = false;
  var _paused = true;
  var conditionalUpdate = function conditionalUpdate(state) {
    // update the persistoid only if we are rehydrated and not paused
    state._persist.rehydrated && _persistoid && !_paused && _persistoid.update(state);
    return state;
  };

  return function (state, action) {
    var _ref = state || {},
        _persist = _ref._persist,
        rest = _objectWithoutProperties(_ref, ['_persist']);

    var restState = rest;

    if (action.type === PERSIST) {
      var _sealed = false;
      var _rehydrate = function _rehydrate(payload, err) {
        // dev warning if we are already sealed
        if (process.env.NODE_ENV !== 'production' && _sealed) console.error('redux-persist: rehydrate for "' + config.key + '" called after timeout.', payload, err);

        // only rehydrate if we are not already sealed
        if (!_sealed) {
          action.rehydrate(config.key, payload, err);
          _sealed = true;
        }
      };
      timeout && setTimeout(function () {
        !_sealed && _rehydrate(undefined, new Error('redux-persist: persist timed out for persist key "' + config.key + '"'));
      }, timeout);

      // @NOTE PERSIST resumes if paused.
      _paused = false;

      // @NOTE only ever create persistoid once, ensure we call it at least once, even if _persist has already been set
      if (!_persistoid) _persistoid = createPersistoid(config);

      // @NOTE PERSIST can be called multiple times, noop after the first
      if (_persist) return state;
      if (typeof action.rehydrate !== 'function' || typeof action.register !== 'function') throw new Error('redux-persist: either rehydrate or register is not a function on the PERSIST action. This can happen if the action is being replayed. This is an unexplored use case, please open an issue and we will figure out a resolution.');

      action.register(config.key);

      getStoredState(config).then(function (restoredState) {
        var migrate = config.migrate || function (s, v) {
          return Promise.resolve(s);
        };
        migrate(restoredState, version).then(function (migratedState) {
          _rehydrate(migratedState);
        }, function (migrateErr) {
          if (process.env.NODE_ENV !== 'production' && migrateErr) console.error('redux-persist: migration error', migrateErr);
          _rehydrate(undefined, migrateErr);
        });
      }, function (err) {
        _rehydrate(undefined, err);
      });

      return _extends({}, baseReducer(restState, action), {
        _persist: { version: version, rehydrated: false }
      });
    } else if (action.type === PURGE) {
      _purge = true;
      action.result(purgeStoredState(config));
      return _extends({}, baseReducer(restState, action), {
        _persist: _persist
      });
    } else if (action.type === FLUSH) {
      action.result(_persistoid && _persistoid.flush());
      return _extends({}, baseReducer(restState, action), {
        _persist: _persist
      });
    } else if (action.type === PAUSE) {
      _paused = true;
    } else if (action.type === REHYDRATE) {
      // noop on restState if purging
      if (_purge) return _extends({}, restState, {
        _persist: _extends({}, _persist, { rehydrated: true })

        // @NOTE if key does not match, will continue to default else below
      });if (action.key === config.key) {
        var reducedState = baseReducer(restState, action);
        var inboundState = action.payload;
        // only reconcile state if stateReconciler and inboundState are both defined
        var reconciledRest = stateReconciler !== false && inboundState !== undefined ? stateReconciler(inboundState, state, reducedState, config) : reducedState;

        var _newState = _extends({}, reconciledRest, {
          _persist: _extends({}, _persist, { rehydrated: true })
        });
        return conditionalUpdate(_newState);
      }
    }

    // if we have not already handled PERSIST, straight passthrough
    if (!_persist) return baseReducer(state, action);

    // run base reducer:
    // is state modified ? return original : return updated
    var newState = baseReducer(restState, action);
    if (newState === restState) return state;else {
      newState._persist = _persist;
      return conditionalUpdate(newState);
    }
  };
}