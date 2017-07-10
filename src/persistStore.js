import { REHYDRATE } from './constants'
import getStoredState from './getStoredState'
import createPersistor from './createPersistor'
import setImmediate from './utils/setImmediate'

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
    setImmediate(() => {
      getStoredState(config, (err, restoredState) => {
        if (err) {
          complete(err)
          return
        }
        // do not persist state for purgeKeys
        if (purgeKeys) {
          if (purgeKeys === '*') restoredState = {}
          else purgeKeys.forEach((key) => delete restoredState[key])
        }
        try {
          store.dispatch(rehydrateAction(restoredState, err))
        } finally {
          complete(err, restoredState)
        }
      })
    })
  } else setImmediate(complete)

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
