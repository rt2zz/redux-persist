"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function makeAdapter() {
  var resolve = void 0,
      reject = void 0;

  return {
    callback: function callback(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    },
    promise: new Promise(function (resolveIn, rejectIn) {
      resolve = resolveIn;
      reject = rejectIn;
    })
  };
}

exports.default = makeAdapter;