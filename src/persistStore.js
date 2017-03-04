import { REHYDRATE } from './constants'
import getStoredState from './getStoredState'
import createPersistor from './createPersistor'
import { NODE_ENV } from './env'

// try to source setImmediate as follows: setImmediate (global) -> global.setImmediate -> setTimeout(fn, 0)
const genericSetImmediate = typeof setImmediate === 'undefined' ? global.setImmediate || function (fn) { return setTimeout(fn, 0) } : setImmediate

export default function persistStore (store, config = {}, onComplete) {
  // defaults
  // @TODO remove shouldRestore
  const shouldRestore = !config.skipRestore
  if (NODE_ENV !== 'production' && config.skipRestore) console.warn('redux-persist: config.skipRestore has been deprecated. If you want to skip restoration use `createPersistor` instead')

  let purgeKeys = null

  // create and pause persistor
  const persistor = createPersistor(store, config)
  persistor.pause()

  // restore
  if (shouldRestore) {
    genericSetImmediate(() => {
      getStoredState(config, (err, restoredState) => {
        // do not persist state for purgeKeys
        if (purgeKeys) {
          if (purgeKeys === '*') restoredState = {}
          else purgeKeys.forEach((key) => delete restoredState[key])
        }

        store.dispatch(rehydrateAction(restoredState, err))
        complete(err, restoredState)
      })
    })
  } else genericSetImmediate(complete)

  function complete (err, restoredState) {
    persistor.resume()
    onComplete && onComplete(err, restoredState)
  }

  return {
    ...persistor,
    purge: (keys) => {
      purgeKeys = keys || '*'
      return persistor.purge(keys)
    }
  }
}

function rehydrateAction (payload, error = null) {
  return {
    type: REHYDRATE,
    payload,
    error
  }
}
