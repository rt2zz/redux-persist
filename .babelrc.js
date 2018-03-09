const { NODE_ENV, BABEL_ENV } = process.env;
const cjs = NODE_ENV === 'test' || BABEL_ENV === 'commonjs'
const loose = true

module.exports = {
  presets: [
    '@babel/flow',
    ['@babel/env', {
      modules: false,
      loose,
      targets: {
        browsers: ['last 2 versions']
      }
    }]
  ],
  plugins: [
    '@babel/proposal-object-rest-spread',
    ['@babel/proposal-class-properties', { loose }],
    cjs && '@babel/transform-modules-commonjs',
  ].filter(Boolean),
}
