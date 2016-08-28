import test from 'ava'

import { purgeStoredState } from '../src'
import { asyncLocalStorage } from '../src/defaultStorages'

test('purgeStoredState (all) returns a promise', t => {
  let purgeResult = purgeStoredState({ storage: asyncLocalStorage })
  t.true(isPromise(purgeResult))
  return purgeResult
})

test('purgeStoredState (whitelist) returns a promise', t => {
  let purgeResult = purgeStoredState({ storage: asyncLocalStorage }, ['foo'])
  t.true(isPromise(purgeResult))
  return purgeResult
})

function isPromise (something) {
  return typeof something === 'object' && typeof something.then === 'function'
}
