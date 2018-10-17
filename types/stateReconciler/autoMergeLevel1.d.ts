declare module "redux-persist/es/stateReconciler/autoMergeLevel1" {
  import { PersistConfig } from "redux-persist";

  // tslint:disable-next-line: strict-export-declare-modifiers
  export default function autoMergeLevel1<S>(inboundState: S, originalState: S, reducedState: S, config: PersistConfig<S>): S;
}

declare module "redux-persist/lib/stateReconciler/autoMergeLevel1" {
  export * from "redux-persist/es/stateReconciler/autoMergeLevel1";
  export { default } from "redux-persist/es/stateReconciler/autoMergeLevel1";
}
