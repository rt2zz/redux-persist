import createAsyncLocalStorage from './defaults/asyncLocalStorage'
import persistStore from './persistStore'
import autoRehydrate from './autoRehydrate'
import getStoredState from './getStoredState'

const storages = {
  asyncLocalStorage: createAsyncLocalStorage('local'),
  asyncSessionStorage: createAsyncLocalStorage('session')
}

export { persistStore, autoRehydrate, getStoredState, storages }
