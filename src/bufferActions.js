var constants = require('./constants')

module.exports = function bufferActions(cb) {
  let active = true
  let queue = []

  return next => action => {
    if (!active){
      return next(action)
    }

    if(action.type === constants.REHYDRATE){
      return next(action)
    }

    if (action.type === constants.REHYDRATE_COMPLETE) {
      active = false
      next(action)
      queue.forEach((queuedAction) => next(queuedAction))
      cb(null, queue)
      delete queue
    }
    else {
      queue.push(action)
    }
  }
}
