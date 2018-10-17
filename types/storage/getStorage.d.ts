declare module "redux-persist/es/storage/getStorage" {
  import { Storage } from "redux-persist/es/types";

  // tslint:disable-next-line: strict-export-declare-modifiers
  export default function getStorage(type: string): Storage;
}

declare module "redux-persist/lib/storage/getStorage" {
  export * from "redux-persist/es/storage/getStorage";
  export { default } from "redux-persist/es/storage/getStorage";
}
