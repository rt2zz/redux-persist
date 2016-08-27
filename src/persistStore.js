import { REHYDRATE, REHYDRATE_ERROR } from './constants'
import getStoredState from './getStoredState'
import createPersistor from './createPersistor'
import { omit } from 'lodash'

// try to source setImmediate as follows: setImmediate (global) -> global.setImmediate -> setTimeout(fn, 0)
const genericSetImmediate = typeof setImmediate === 'undefined' ? global.setImmediate || function (fn) { return setTimeout(fn, 0) } : setImmediate

export default function persistStore (store, config = {}, onComplete) {
  // defaults
  // @TODO remove shouldRestore
  const shouldRestore = !config.skipRestore
  if (process.env.NODE_ENV !== 'production' && config.skipRestore) console.warn('redux-persist: config.skipRestore has been deprecated. If you want to skip restoration use `createPersistor` instead')

  let purgeKeys = null

  // create and pause persistor
  const persistor = createPersistor(store, config)
  persistor.pause()

  // restore
  if (shouldRestore) {
    genericSetImmediate(() => {
      getStoredState(config, (err, restoredState) => {
        // do not persist state for purgeKeys
        restoredState = purgeKeys
          ? purgeKeys === '*' ? {} : omit(restoredState, purgeKeys)
          : restoredState

        if (restoredState) store.dispatch(rehydrateAction(restoredState))
        if (err) store.dispatch(rehydrateErrorAction(err))
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
      persistor.purge(keys)
    }
  }
}

function rehydrateAction (data) {
  return {
    type: REHYDRATE,
    payload: data
  }
}

function rehydrateErrorAction (err) {
  return {
    type: REHYDRATE_ERROR,
    payload: err
  }
}
