// @flow

import createWebStorage from './storage/createWebStorage'

export default createWebStorage('local')
export { default as session } from './storage/session'
