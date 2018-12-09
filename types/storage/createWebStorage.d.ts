declare module "redux-persist/es/storage/createWebStorage" {
  import { WebStorage } from "redux-persist/es/types";

  // tslint:disable-next-line: strict-export-declare-modifiers
  export default function createWebStorage(type: string): WebStorage;
}

declare module "redux-persist/lib/storage/createWebStorage" {
  export * from "redux-persist/es/storage/createWebStorage";
  export { default } from "redux-persist/es/storage/createWebStorage";
}
