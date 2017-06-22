// // @flow
// // credit @gcanti, taken from https://github.com/gcanti/flow-static-land/blob/e36cd55b8f8541e81828ec39964bdb6f5ccbec91/src/Fun.js

// export type Fn1<A, B> = (a: A, ...rest: Array<void>) => B
// export type Fn2<A, B, C> = (a: A, b: B, ...rest: Array<void>) => C
// export type Fn3<A, B, C, D> = (a: A, b: B, c: C, ...rest: Array<void>) => D

// export type CurriedFn2<A, B, C> = Fn1<A, Fn1<B, C>> & Fn2<A, B, C>
// export type CurriedFn3<A, B, C, D> = Fn1<A, CurriedFn2<B, C, D>> &
//   Fn2<A, B, Fn1<C, D>> &
//   Fn3<A, B, C, D>

// declare function curry<A, B, C>(f: Fn2<A, B, C>): CurriedFn2<A, B, C> // eslint-disable-line no-redeclare
// declare function curry<A, B, C, D>(f: Fn3<A, B, C, D>): CurriedFn3<A, B, C, D> // eslint-disable-line no-redeclare

// declare function curried(f, length, acc) {
//   return function() {
//     const combined = acc.concat(Array.prototype.slice.call(arguments))
//     return combined.length >= length
//       ? f.apply(this, combined)
//       : curried(f, length, combined)
//   }
// }

// export function curry(f: Function) {
//   // eslint-disable-line no-redeclare
//   return curried(f, f.length, [])
// }
