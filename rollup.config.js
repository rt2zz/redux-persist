import nodeResolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import filesize from "rollup-plugin-filesize"
import replace from "rollup-plugin-replace"
import babel from "rollup-plugin-babel"
import uglify from "rollup-plugin-uglify"
const name = require("./package").name

const isProd = process.env.NODE_ENV === "production"
const suffix = isProd ? ".min" : ""

export default {
  entry: "es/index.js",
  plugins: [
    nodeResolve(),
    commonjs(),
    babel(),
    replace({
      "process.env.NODE_ENV": process.env.NODE_ENV
    }),
    isProd ? uglify() : () => {},
    filesize()
  ],
  moduleName: "redux-persist",
  sourceMap: true,
  targets: [{ dest: "dist/" + name + suffix + ".js", format: "iife" }]
}
