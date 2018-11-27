'use strict';

exports.__esModule = true;
exports.default = createWebStorage;

var _getStorage = require('./getStorage');

var _getStorage2 = _interopRequireDefault(_getStorage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createWebStorage(type) {
  var storage = (0, _getStorage2.default)(type);
  return {
    getItem: function getItem(key) {
      return new Promise(function (resolve, reject) {
        resolve(storage.getItem(key));
      });
    },
    setItem: function setItem(key, item) {
      return new Promise(function (resolve, reject) {
        resolve(storage.setItem(key, item));
      });
    },
    removeItem: function removeItem(key) {
      return new Promise(function (resolve, reject) {
        resolve(storage.removeItem(key));
      });
    }
  };
}