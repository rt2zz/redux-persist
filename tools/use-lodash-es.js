// Thanks to redux for this:
// https://github.com/reactjs/redux/blob/master/build/use-lodash-es.js
module.exports = function () {
  return {
    visitor: {
      ImportDeclaration (path) {
        var source = path.node.source
        source.value = source.value.replace(/^lodash($|\/)/, 'lodash-es$1')
      }
    }
  }
}
