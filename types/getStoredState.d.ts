declare module "redux-persist/es/getStoredState" {
  import { PersistConfig } from "redux-persist/es/types";

  // tslint:disable-next-line: strict-export-declare-modifiers
  export default function getStoredState(config: PersistConfig<any>): Promise<object | undefined>;
}

declare module "redux-persist/lib/getStoredState" {
  export * from "redux-persist/es/getStoredState";
  export { default } from "redux-persist/es/getStoredState";
}
