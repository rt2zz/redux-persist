import { StoreEnhancer } from "redux";
import { AutoRehydrateConfig } from "redux-persist";

export default function autoRehydrate<State>(autoRehydrateConfig?: AutoRehydrateConfig): StoreEnhancer<State>;