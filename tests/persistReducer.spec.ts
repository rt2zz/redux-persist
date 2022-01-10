import persistReducer from '../src/persistReducer'
import createMemoryStorage from './utils/createMemoryStorage'
import { PERSIST } from '../src/constants'
import sleep from './utils/sleep'

const reducer = () => ({})
const config = {
  key: 'persist-reducer-test',
  version: 1,
  storage: createMemoryStorage()
}

test('persistedReducer does not automatically set _persist state', () => {
  const persistedReducer = persistReducer(config, reducer)
  const state = persistedReducer({}, {type: "UNDEFINED"})
  console.log('state', state)
  expect(state._persist).toBeUndefined()
})

test('persistedReducer does returns versioned, rehydrate tracked _persist state upon PERSIST', () => {
  const persistedReducer = persistReducer(config, reducer)
  const register = jest.fn()
  const rehydrate = jest.fn()
  const state = persistedReducer({}, { type: PERSIST, register, rehydrate })
  expect(state._persist).toEqual({ version: 1, rehydrated: false})
})

test('persistedReducer calls register and rehydrate after PERSIST', async () => {
  const persistedReducer = persistReducer(config, reducer)
  const register = jest.fn()
  const rehydrate = jest.fn()
  persistedReducer({}, { type: PERSIST, register, rehydrate })
  await sleep(5000)
  expect(register).toHaveBeenCalledTimes(1)
  expect(rehydrate).toHaveBeenCalledTimes(1)
})
