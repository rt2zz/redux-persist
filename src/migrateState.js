// @flow

import { DEFAULT_VERSION } from './constants'

import type { PersistConfig, MigrationManifest } from './types'

export function migrateState(
  state: Object = {},
  migrations: MigrationManifest,
  currentVersion: number,
  { debug }: PersistConfig
) {
  let inboundVersion = (state && state.version) || DEFAULT_VERSION
  if (inboundVersion === currentVersion) {
    if (process.env.NODE_ENV !== 'production' && debug)
      console.log('redux-persist: verions match, noop migration')
    return state
  }
  if (inboundVersion > currentVersion) {
    if (process.env.NODE_ENV !== 'production' && debug)
      console.error('redux-persist: downgrading version is not supported')
    return state
  }

  let migrationKeys = Object.keys(migrations)
    .map(ver => parseInt(ver))
    .filter(key => key > inboundVersion)
    .sort()

  if (process.env.NODE_ENV !== 'production' && debug)
    console.log('redux-persist: migrationKeys', migrationKeys)
  let migratedState = migrationKeys.reduce((state, versionKey) => {
    if (process.env.NODE_ENV !== 'production' && debug)
      console.log('redux-persist: running migration for versionKey', versionKey)
    return migrations[versionKey](state)
  }, state)

  return migratedState
}
