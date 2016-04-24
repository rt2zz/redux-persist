import autoRehydrate from './autoRehydrate'
import getStoredState from './getStoredState'
import createAsyncLocalStorage from './defaults/asyncLocalStorage'
import createPersistor from './createPersistor'
import persistStore from './persistStore'

const storages = {
  asyncLocalStorage: createAsyncLocalStorage('local'),
  asyncSessionStorage: createAsyncLocalStorage('session')
}

export { persistStore, autoRehydrate, getStoredState, createPersistor, storages }
