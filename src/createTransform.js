// @flow

type TransformConfig = {
  allowList?: Array<string>,
  blockList?: Array<string>,
}

export default function createTransform(
  // @NOTE inbound: transform state coming from redux on its way to being serialized and stored
  inbound: ?Function,
  // @NOTE outbound: transform state coming from storage, on its way to be rehydrated into redux
  outbound: ?Function,
  config: TransformConfig = {}
) {
  let allowList = config.allowList || null
  let blockList = config.blockList || null

  function allowListBlockListCheck(key) {
    if (allowList && allowList.indexOf(key) === -1) return true
    if (blockList && blockList.indexOf(key) !== -1) return true
    return false
  }

  return {
    in: (state: Object, key: string, fullState: Object) =>
      !allowListBlockListCheck(key) && inbound
        ? inbound(state, key, fullState)
        : state,
    out: (state: Object, key: string, fullState: Object) =>
      !allowListBlockListCheck(key) && outbound
        ? outbound(state, key, fullState)
        : state,
  }
}
