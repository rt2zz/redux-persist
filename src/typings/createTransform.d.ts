declare module 'redux-persist/createTransform' {
  type TransformConfig = {
    whitelist?: string[],
    blacklist?: string[],
  }

  type Transformer = {
    in: (state: Object, key: string) => object,
    out: (state: Object, key: string) => object,
  }

  export default function createTransform(
    inbound: (partialState: any, key: string) => object | void,
    outbound: (partialState: any, key: string) => object | void,
    config?: TransformConfig
  ): Transformer;
}