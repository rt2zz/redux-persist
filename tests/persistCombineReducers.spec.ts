import persistCombineReducers from '../src/persistCombineReducers'
import createMemoryStorage from './utils/createMemoryStorage'

const config = {
  key: 'TestConfig',
  storage: createMemoryStorage()
}

test('persistCombineReducers returns a function', () => {
  const reducer = persistCombineReducers(config, {
    foo: () => ({})
  })

  expect(typeof reducer).toBe('function');
})

/*
test.skip('persistCombineReducers merges two levels deep of state', t => {

})
*/
