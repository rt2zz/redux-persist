// @flow

import { DEFAULT_VERSION } from './constants'

import type { MigrationManifest } from './types'

export default function createMigrate(
  migrations: MigrationManifest,
  config?: { debug: boolean }
) {
  let { debug } = config || {}
  return function(state: Object = {}, currentVersion: number): Promise<any> {
    let inboundVersion = (state && state.version) || DEFAULT_VERSION
    if (inboundVersion === currentVersion) {
      if (process.env.NODE_ENV !== 'production' && debug)
        console.log('redux-persist: verions match, noop migration')
      return Promise.resolve(state)
    }
    if (inboundVersion > currentVersion) {
      if (process.env.NODE_ENV !== 'production' && debug)
        console.error('redux-persist: downgrading version is not supported')
      return Promise.resolve(state)
    }

    let migrationKeys = Object.keys(migrations)
      .map(ver => parseInt(ver))
      .filter(key => key > inboundVersion)
      .sort()

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
