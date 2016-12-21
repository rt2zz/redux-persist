import { Store } from "redux";
import { PersistorConfig, Persistor, OnComplete } from "redux-persist";

export default function persistStore<State>(store: Store<State>, persistorConfig?: PersistorConfig, onComplete?: OnComplete<any>): Persistor;