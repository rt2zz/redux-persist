// @noflow
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import pkg from './package.json';

const ensureArray = maybeArr => Array.isArray(maybeArr) ? maybeArr : [maybeArr];

const makeExternalPredicate = externalArr => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return id => pattern.test(id);
};

const createConfig = ({
  input,
  output,
  umd = false,
  env,
} = {}) => ({
  experimentalCodeSplitting: Array.isArray(input),
  input,
  output: ensureArray(output).map(format =>
    Object.assign(
      {},
      format,
      {
        exports: 'named',
        name: 'ReduxPersist',
        sourcemap: umd,
      },
    )
  ),
  external: makeExternalPredicate(umd ? [] : [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    'react',
    'react-native',
  ]),
  plugins: [
    nodeResolve({
      jsnext: true
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    umd && replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    umd && env === 'production' && uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
    }),
  ].filter(Boolean),
})

export default [
  createConfig({
    input: ['src/index.js', 'src/react.js', 'src/storage.js'],
    output: [
      { dir: 'lib', format: 'cjs' },
      { dir: 'es', format: 'es' },
    ],
  }),
  createConfig({
    input: 'src/storage.native.js',
    output: {
      file: 'lib/storage.native.js',
      format: 'cjs',
    },
  }),
  createConfig({
    input: 'src/index.js',
    umd: true,
    env: 'development',
    output: {
      file: `dist/${pkg.name}.js`,
      format: 'umd',
    },
  }),
  createConfig({
    input: 'src/index.js',
    umd: true,
    env: 'production',
    output: {
      file: `dist/${pkg.name}.min.js`,
      format: 'umd',
    },
  }),
]

