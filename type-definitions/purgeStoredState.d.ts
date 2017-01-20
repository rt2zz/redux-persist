import { PersistorConfig } from "redux-persist";

export default function purgeStoredState(persistorConfig?: PersistorConfig, keys?: string[]): Promise<void>;