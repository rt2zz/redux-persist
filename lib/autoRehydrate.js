'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = autoRehydrate;

var _constants = require('./constants');

var _isStatePlainEnough = require('./utils/isStatePlainEnough');

var _isStatePlainEnough2 = _interopRequireDefault(_isStatePlainEnough);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function autoRehydrate() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var stateReconciler = config.stateReconciler || defaultStateReconciler;

  return function (next) {
    return function (reducer, initialState, enhancer) {
      var store = next(liftReducer(reducer), initialState, enhancer);
      return _extends({}, store, {
        replaceReducer: function replaceReducer(reducer) {
          return store.replaceReducer(liftReducer(reducer));
        }
      });
    };
  };

  function liftReducer(reducer) {
    var rehydrated = false;
    var preRehydrateActions = [];
    return function (state, action) {
      if (action.type !== _constants.REHYDRATE) {
        if (config.log && !rehydrated) preRehydrateActions.push(action); // store pre-rehydrate actions for debugging
        return reducer(state, action);
      } else {
        if (config.log && !rehydrated) logPreRehydrate(preRehydrateActions);
        rehydrated = true;

        var inboundState = action.payload;
        var reducedState = reducer(state, action);

        return stateReconciler(state, inboundState, reducedState, config.log);
      }
    };
  }
}

function logPreRehydrate(preRehydrateActions) {
  if (preRehydrateActions.length > 0) {
    console.log('\n      redux-persist/autoRehydrate: %d actions were fired before rehydration completed. This can be a symptom of a race\n      condition where the rehydrate action may overwrite the previously affected state. Consider running these actions\n      after rehydration:\n    ', preRehydrateActions.length);
  }
}

function defaultStateReconciler(state, inboundState, reducedState, log) {
  var newState = _extends({}, reducedState);

  Object.keys(inboundState).forEach(function (key) {
    // if initialState does not have key, skip auto rehydration
    if (!state.hasOwnProperty(key)) return;

    // if initial state is an object but inbound state is null/undefined, skip
    if (_typeof(state[key]) === 'object' && !inboundState[key]) {
      if (log) console.log('redux-persist/autoRehydrate: sub state for key `%s` is falsy but initial state is an object, skipping autoRehydrate.', key);
      return;
    }

    // if reducer modifies substate, skip auto rehydration
    if (state[key] !== reducedState[key]) {
      if (log) console.log('redux-persist/autoRehydrate: sub state for key `%s` modified, skipping autoRehydrate.', key);
      newState[key] = reducedState[key];
      return;
    }

    // otherwise take the inboundState
    if ((0, _isStatePlainEnough2.default)(inboundState[key]) && (0, _isStatePlainEnough2.default)(state[key])) newState[key] = _extends({}, state[key], inboundState[key]); // shallow merge
    else newState[key] = inboundState[key]; // hard set

    if (log) console.log('redux-persist/autoRehydrate: key `%s`, rehydrated to ', key, newState[key]);
  });
  return newState;
}