import nodeResolve from 'rollup-plugin-node-resolve';
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
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  ]
}

if (env === 'production') {
}

export default config

