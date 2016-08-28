import createAsyncLocalStorage from './defaults/asyncLocalStorage'

import autoRehydrate from './autoRehydrate'
import createPersistor from './createPersistor'
import createTransform from './createTransform'
import getStoredState from './getStoredState'
import persistStore from './persistStore'
import purgeStoredState from './purgeStoredState'

const storages = {
  asyncLocalStorage: createAsyncLocalStorage('local'),
  asyncSessionStorage: createAsyncLocalStorage('session')
}

export { autoRehydrate, createPersistor, createTransform, getStoredState, persistStore, purgeStoredState, storages }
