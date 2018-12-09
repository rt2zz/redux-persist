declare module "redux-persist/es/createPersistoid" {
  import { PersistConfig, Persistoid } from "redux-persist/es/types";

  // tslint:disable-next-line: strict-export-declare-modifiers
  export default function createPersistoid(config: PersistConfig<any>): Persistoid;
}

declare module "redux-persist/lib/createPersistoid" {
  export * from "redux-persist/es/createPersistoid";
  export { default } from "redux-persist/es/createPersistoid";
}
