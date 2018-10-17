declare module "redux-persist/es/stateReconciler/autoMergeLevel2" {
  import { PersistConfig } from "redux-persist";

  // tslint:disable-next-line: strict-export-declare-modifiers
  export default function autoMergeLevel2<S>(inboundState: S, originalState: S, reducedState: S, config: PersistConfig<S>): S;
}

declare module "redux-persist/lib/stateReconciler/autoMergeLevel2" {
  export * from "redux-persist/es/stateReconciler/autoMergeLevel2";
  export { default } from "redux-persist/es/stateReconciler/autoMergeLevel2";
}
