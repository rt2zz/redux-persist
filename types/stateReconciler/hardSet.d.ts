declare module "redux-persist/es/stateReconciler/hardSet" {
  import { PersistConfig } from "redux-persist";

  // tslint:disable-next-line: strict-export-declare-modifiers
  export default function hardSet<S>(inboundState: S): S;
}

declare module "redux-persist/lib/stateReconciler/hardSet" {
  export * from "redux-persist/es/stateReconciler/hardSet";
  export { default } from "redux-persist/es/stateReconciler/hardSet";
}
