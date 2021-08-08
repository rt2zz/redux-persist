import pluginNodeResolve from "@rollup/plugin-node-resolve"
import pluginCommonjs from "@rollup/plugin-commonjs"
import pluginTypescript from "@rollup/plugin-typescript"
import { babel as pluginBabel } from "@rollup/plugin-babel"
import { terser as pluginTerser } from "rollup-plugin-terser"

const moduleName = 'ReduxPersist'

import * as path from 'path'

import pkg from "./package.json"

const banner = `/*!
  ${moduleName}.js v${pkg.version}
  ${pkg.homepage}
  Released under the ${pkg.license} License.
*/`;

const config = [
  // browser
  {
    // entry point
    input: 'src/index.ts',
    output: [
      // no minify
      {
        name: moduleName,
        file: pkg.browser,
        format: 'iife',
        sourcemap: 'inline',
        // copyright
        banner,
      },
      // minify
      {
        name: moduleName,
        file: pkg.browser.replace('.js', '.min.js'),
        format: 'iife',
        banner,
        plugins: [
          pluginTerser(),
        ],
      }
    ],
    plugins: [
      pluginTypescript({
        module: "esnext"
      }),
      pluginCommonjs({
        extensions: [".js", ".ts"]
      }),
      pluginBabel({
        babelHelpers: "bundled",
        configFile: path.resolve(__dirname, ".babelrc.js")
      }),
      pluginNodeResolve({
        browser: true
      })
    ]
  },
  // es module
  {
    // entry point
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: "es",
        sourcemap: "inline",
        banner,
        exports: "named"
      },
    ],
    external: [
      ...Object.keys(pkg.devDependencies || {})
    ],
    plugins: [
      pluginTypescript({
        module: "esnext"
      }),
      pluginBabel({
        babelHelpers: "bundled",
        configFile: path.resolve(__dirname, ".babelrc.js")
      })
    ]
  },
];

export default config

