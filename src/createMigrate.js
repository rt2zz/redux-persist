// @flow

import { DEFAULT_VERSION } from './constants'

import type { PersistedState, MigrationManifest } from './types'

export default function createMigrate(
  migrations: MigrationManifest,
  config?: { debug: boolean }
) {
  let { debug } = config || {}
  return async function(
    state: PersistedState,
    currentVersion: number
  ): Promise<PersistedState> {
    if (!state) {
      if (process.env.NODE_ENV !== 'production' && debug)
        console.log('redux-persist: no inbound state, skipping migration')
      return undefined
    }

    let inboundVersion: number =
      state._persist && state._persist.version !== undefined
        ? state._persist.version
        : DEFAULT_VERSION
    if (inboundVersion === currentVersion) {
      if (process.env.NODE_ENV !== 'production' && debug)
        console.log('redux-persist: versions match, noop migration')
      return state
    }
    if (inboundVersion > currentVersion) {
      if (process.env.NODE_ENV !== 'production')
        console.error('redux-persist: downgrading version is not supported')
      return state
    }

    let migrationKeys = Object.keys(migrations)
      .map(ver => parseInt(ver))
      .filter(key => currentVersion >= key && key > inboundVersion)
      .sort((a, b) => a - b)

    if (process.env.NODE_ENV !== 'production' && debug)
      console.log('redux-persist: migrationKeys', migrationKeys)

    let migratedState = await migrationKeys.reduce(
      async (state, versionKey) => {
        if (process.env.NODE_ENV !== 'production' && debug)
          console.log(
            'redux-persist: running migration for versionKey',
            versionKey
          )
        return await migrations[versionKey](await state)
      },
      state
    )
    return migratedState
  }
}
