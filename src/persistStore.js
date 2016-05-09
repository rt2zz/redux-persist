import * as constants from './constants'
import getStoredState from './getStoredState'
import createPersistor from './createPersistor'

const genericSetImmediate = typeof setImmediate === 'undefined' ? global.setImmediate : setImmediate

export default function persistStore (store, config = {}, onComplete) {
  // defaults
  const shouldRestore = !config.skipRestore
  if (process.env.NODE_ENV !== 'production' && config.skipRestore) console.warn('redux-persist: config.skipRestore has been deprecated. If you want to skip restoration use `createPersistor` instead')

  // create and pause persistor
  const persistor = createPersistor(store, config)
  persistor.pause()

  // restore
  if (shouldRestore) {
    genericSetImmediate(() => {
      getStoredState({...config, purgeMode: persistor._getPurgeMode()}, (err, restoredState) => {
        // filter any keys not in initialState
        let initialStateKeys = Object.keys(store.getState())
        let filteredRestoredState = {}
        initialStateKeys.forEach((key) => {
          if (restoredState.hasOwnProperty(key)) filteredRestoredState[key] = restoredState[key]
        })
        if (restoredState) store.dispatch(rehydrateAction(filteredRestoredState))
        if (err) store.dispatch(rehydrateErrorAction(err))
        complete(err, filteredRestoredState)
      })
    })
  } else genericSetImmediate(complete)

  function complete (err, restoredState) {
    persistor.resume()
    onComplete && onComplete(err, restoredState)
  }

  return persistor
}

function rehydrateAction (data) {
  return {
    type: constants.REHYDRATE,
    payload: data
  }
}

function rehydrateErrorAction (err) {
  return {
    type: constants.REHYDRATE_ERROR,
    payload: err
  }
}
