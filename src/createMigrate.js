// @flow

import { DEFAULT_VERSION } from './constants'

import type { PersistedState, MigrationManifest } from './types'

export default function createMigrate(
  migrations: MigrationManifest,
  config?: { debug: boolean },
  downgradeMigrations?: MigrationManifest
) {
  let { debug } = config || {}
  return function(
    state: PersistedState,
    currentVersion: number
  ): Promise<PersistedState> {
    if (!state) {
      if (process.env.NODE_ENV !== 'production' && debug)
        console.log('redux-persist: no inbound state, skipping migration')
      return Promise.resolve(undefined)
    }

    let inboundVersion: number =
      state._persist && state._persist.version !== undefined
        ? state._persist.version
        : DEFAULT_VERSION
    if (inboundVersion === currentVersion) {
      if (process.env.NODE_ENV !== 'production' && debug)
        console.log('redux-persist: versions match, noop migration')
      return Promise.resolve(state)
    }

    let migrationKeys
    if (inboundVersion > currentVersion) {
      if (process.env.NODE_ENV !== 'production' && debug)
        console.log(
          `redux-persist: downgrading from version ${inboundVersion} to version ${currentVersion}`
        )
      if (!downgradeMigrations) {
        console.error(
          'redux-persist: not possibble to downgrade. downgradeMigrations has not been defined.'
        )
        return Promise.resolve(state)
      }
      // When downgrading we want to sort the migration functions in descending order
      migrationKeys = Object.keys(downgradeMigrations)
        .map(ver => parseInt(ver))
        .filter(key => inboundVersion >= key && key > currentVersion)
        .sort((a, b) => b - a)
    } else {
      // When upgrading the applying order is instead ascending
      migrationKeys = Object.keys(migrations)
        .map(ver => parseInt(ver))
        .filter(key => currentVersion >= key && key > inboundVersion)
        .sort((a, b) => a - b)
    }

    if (process.env.NODE_ENV !== 'production' && debug)
      console.log('redux-persist: migrationKeys', migrationKeys)
    try {
      let migratedState = migrationKeys.reduce((state, versionKey) => {
        if (process.env.NODE_ENV !== 'production' && debug)
          console.log(
            'redux-persist: running migration for versionKey',
            versionKey
          )
        return migrations[versionKey](state)
      }, state)
      return Promise.resolve(migratedState)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
