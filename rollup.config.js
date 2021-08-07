// @noflow
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';

const env = process.env.NODE_ENV
const config = {
  output: {
    format: 'umd',
    name: 'ReduxPersist',
    exports: 'named',
    sourcemap: true,  
  },
  plugins: [
    nodeResolve({
      jsnext: true
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  ]
}

if (env === 'production') {
}

export default config

