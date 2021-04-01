// @flow

type TransformConfig = {
  whitelist?: Array<string>, // Deprecated
  blacklist?: Array<string>, // Deprecated
  allowlist?: Array<string>,
  blocklist?: Array<string>,
}

export default function createTransform(
  // @NOTE inbound: transform state coming from redux on its way to being serialized and stored
  inbound: ?Function,
  // @NOTE outbound: transform state coming from storage, on its way to be rehydrated into redux
  outbound: ?Function,
  config: TransformConfig = {}
) {
  if (process.env.NODE_ENV !== 'production') {
    if (config.whitelist) {
      console.warn(
        `redux-persist "whitelist" is deprecated and will be removed in the next major update. Use "allowlist" instead.`
      )
    }
    if (config.blacklist) {
      console.warn(
        `redux-persist "blacklist" is deprecated and will be removed in the next major update. Use "blocklist" instead.`
      )
    }
  }
  let allowlist = config.allowlist || config.whitelist || null
  let blocklist = config.blocklist || config.blacklist || null

  function allowlistBlocklistCheck(key) {
    if (allowlist && allowlist.indexOf(key) === -1) return true
    if (blocklist && blocklist.indexOf(key) !== -1) return true
    return false
  }

  return {
    in: (state: Object, key: string, fullState: Object) =>
      !allowlistBlocklistCheck(key) && inbound
        ? inbound(state, key, fullState)
        : state,
    out: (state: Object, key: string, fullState: Object) =>
      !allowlistBlocklistCheck(key) && outbound
        ? outbound(state, key, fullState)
        : state,
  }
}
