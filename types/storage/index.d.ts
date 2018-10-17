declare module "redux-persist/es/storage" {
  import { WebStorage } from "redux-persist/es/types";

  const localStorage: WebStorage;
  export default localStorage;
}

declare module "redux-persist/lib/storage" {
  export * from "redux-persist/es/storage";
  export { default } from "redux-persist/es/storage";
}
