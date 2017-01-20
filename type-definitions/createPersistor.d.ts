import { Store } from "redux";
import { PersistorConfig, Persistor } from "redux-persist";

export default function createPersistor<State>(store: Store<State>, persistorConfig: PersistorConfig): Persistor;