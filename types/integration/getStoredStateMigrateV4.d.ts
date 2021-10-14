declare module "redux-persist/es/integration/getStoredStateMigrateV4" {
  import { PersistConfig, Transform } from "redux-persist/es/types";

  interface V4Storage {
    keys?(cb: (err: any, allKeys: Array<string>) => any): any;
    getAllKeys?(cb: (err: any, allKeys: Array<string>) => any): any;
    getItem?(cb: (err: any, serialized?: string | null) => any): any;
  }

  interface V4Config {
    storage?: V4Storage;
    keyPrefix?: string;
    transforms?: Array<Transform<any, any>>;
    /**
     * @deprecated Use "blocklist" instead. This property will be removed in the next major update.
     */
    blacklist?: Array<string>;
    /**
     * @deprecated Use "allowlist" instead. This property will be removed in the next major update.
     */
    whitelist?: Array<string>;
    allowlist?: Array<string>;
    blocklist?: Array<string>;
  }

  // tslint:disable-next-line: strict-export-declare-modifiers
  export default function getStoredState(v4Config: V4Config): (config: PersistConfig<any>) => Promise<object | undefined>;
}

declare module "redux-persist/lib/integration/getStoredStateMigrateV4" {
  export * from "redux-persist/es/integration/getStoredStateMigrateV4";
  export { default } from "redux-persist/es/integration/getStoredStateMigrateV4";
}
