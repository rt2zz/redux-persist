import createAsyncLocalStorage from './asyncStorage'
import createSyncLocalStorage from './syncStorage'

export const asyncLocalStorage = createAsyncLocalStorage('local')
export const asyncSessionStorage = createAsyncLocalStorage('session')

export const syncLocalStorage = createSyncLocalStorage('local')
export const syncSessionStorage = createSyncLocalStorage('session')
