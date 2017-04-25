const setImmediate = typeof global.setImmediate !== 'undefined' ? global.setImmediate : setTimeout

export default setImmediate
