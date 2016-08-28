import createAsyncLocalStorage from './defaults/asyncLocalStorage'

export const asyncLocalStorage = createAsyncLocalStorage('local')
export const asyncSessionStorage = createAsyncLocalStorage('session')
