declare module "redux-persist/es/storage/session" {
  import { WebStorage } from "redux-persist/es/types";

  const sessionStorage: WebStorage;
  export default sessionStorage;
}

declare module "redux-persist/lib/storage/session" {
  export * from "redux-persist/es/storage/session";
  export { default } from "redux-persist/es/storage/session";
}
