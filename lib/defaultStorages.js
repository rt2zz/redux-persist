'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.asyncSessionStorage = exports.asyncLocalStorage = undefined;

var _asyncLocalStorage = require('./defaults/asyncLocalStorage');

var _asyncLocalStorage2 = _interopRequireDefault(_asyncLocalStorage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var asyncLocalStorage = exports.asyncLocalStorage = (0, _asyncLocalStorage2.default)('local');
var asyncSessionStorage = exports.asyncSessionStorage = (0, _asyncLocalStorage2.default)('session');