declare module 'redux-persist/createMigrate' {
  import { MigrationManifest, PersistedState } from 'redux-persist/types';

  type MigrationConfig = { debug: boolean };
  type Migrator = (state: PersistedState, currentVersion: number) => Promise<PersistedState>;

  export default function createMigrate(migrations: MigrationManifest, config?: MigrationConfig): Migrator;
}