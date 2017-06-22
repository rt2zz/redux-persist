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
    if (debug) console.log('redux-p: verions match, noop migration')
    return state
  }
  if (inboundVersion > currentVersion) {
    if (debug) console.error('redux-p: downgrading version is not supported')
    return state
  }

  let migrationKeys = Object.keys(migrations)
    .map(ver => parseInt(ver))
    .filter(key => key > inboundVersion)
    .sort()

  if (debug) console.log('redux-p: migrationKeys', migrationKeys)
  let migratedState = migrationKeys.reduce((state, versionKey) => {
    if (debug)
      console.log('redux-p: running migration for versionKey', versionKey)
    return migrations[versionKey](state)
  }, state)

  return migratedState
}
