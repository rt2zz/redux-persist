/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEFAULT_VERSION } from './constants'

import type { PersistedState, MigrationManifest } from './types'

export default function createMigrate(
  migrations: MigrationManifest,
  config?: { debug: boolean }
): (state: PersistedState, currentVersion: number) => Promise<PersistedState> {
  const { debug } = config || {}
  return function(
    state: PersistedState,
    currentVersion: number
  ): Promise<PersistedState> {
    if (!state) {
      if (process.env.NODE_ENV !== 'production' && debug)
        console.log('redux-persist: no inbound state, skipping migration')
      return Promise.resolve(undefined)
    }

    const inboundVersion: number =
      state._persist && state._persist.version !== undefined
        ? state._persist.version
        : DEFAULT_VERSION
    if (inboundVersion === currentVersion) {
      if (process.env.NODE_ENV !== 'production' && debug)
        console.log('redux-persist: versions match, noop migration')
      return Promise.resolve(state)
    }
    if (inboundVersion > currentVersion) {
      if (process.env.NODE_ENV !== 'production')
        console.error('redux-persist: downgrading version is not supported')
      return Promise.resolve(state)
    }

    const migrationKeys = Object.keys(migrations)
      .map(ver => parseInt(ver))
      .filter(key => currentVersion >= key && key > inboundVersion)
      .sort((a, b) => a - b)

    if (process.env.NODE_ENV !== 'production' && debug)
      console.log('redux-persist: migrationKeys', migrationKeys)
    try {
      const migratedState: any = migrationKeys.reduce((state: any, versionKey) => {
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
