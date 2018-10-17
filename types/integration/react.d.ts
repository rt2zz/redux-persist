declare module "redux-persist/integration/react" {
  import { ReactNode, PureComponent } from "react";
  import { Persistor } from "redux-persist/es/types";

  /** @see PersistGate */
  interface PersistGateProps {
    persistor: Persistor;
    onBeforeLift?(): void | Promise<void>;
    children?: ReactNode | ((bootstrapped: boolean) => ReactNode);
    loading?: ReactNode;
  }

  /** @see PersistGate */
  interface PersistorGateState {
    bootstrapped: boolean;
  }

  /**
   * Entry point of your react application to allow it persist a given store @see Persistor and its configuration.
   * @see Persistor
   * @see PersistGateProps
   * @see PersistGateState
   */
  class PersistGate extends React.PureComponent<PersistGateProps, PersistorGateState> {}
}

declare module "redux-persist/es/integration/react" {
  export * from "redux-persist/integration/react";
}

declare module "redux-persist/lib/integration/react" {
  export * from "redux-persist/integration/react";
}
