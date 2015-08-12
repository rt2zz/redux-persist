var constants = require('./constants')

module.exports = function bufferActions(cb) {
  let active = true
  let queue = []

  return next => action => {
    if (!active){
      return next(action)
    }

    if(action.meta && action.meta[constants.actionMeta.rehydrate]){
      return next(action)
    }

    if (action.meta && action.meta[constants.actionMeta.complete]) {
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
