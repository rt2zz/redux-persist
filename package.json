{
  "name": "redux-persist",
  "version": "6.0.0",
  "description": "persist and rehydrate redux stores",
  "main": "lib/index.js",
  "module": "es/index.js",
  "types": "./types/index.d.ts",
  "repository": "rt2zz/redux-persist",
  "files": [
    "es",
    "src",
    "lib",
    "dist",
    "integration",
    "types",
    "README.md"
  ],
  "scripts": {
    "ava": "cross-env BABEL_ENV=commonjs ava",
    "build": "npm run flow-copy && npm run build:commonjs && npm run build:es && npm run build:umd && npm run build:umd:min",
    "build:commonjs": "cross-env BABEL_ENV=commonjs babel src --out-dir lib",
    "build:es": "cross-env BABEL_ENV=es babel src --out-dir es",
    "build:umd": "cross-env BABEL_ENV=es NODE_ENV=development rollup -c -i src/index.js -o dist/redux-persist.js",
    "build:umd:min": "cross-env BABEL_ENV=es NODE_ENV=production rollup -c -i src/index.js -o dist/redux-persist.min.js",
    "clean": "rimraf es && rimraf lib",
    "flow-copy": "flow-copy-source src es && flow-copy-source src lib",
    "prepare": "npm run build",
    "precommit": "lint-staged",
    "stats:size": "node ./scripts/size-estimator.js",
    "test": "flow && cross-env BABEL_ENV=commonjs ava",
    "test:typescript": "dtslint types",
    "version": "npm run clean && npm run build && npm run stats:size | tail -1 >> LIBSIZE.md && git add LIBSIZE.md"
  },
  "lint-staged": {
    "src/**/*.js": [
      "prettier --write",
      "git add"
    ]
  },
  "author": "",
  "license": "MIT",
  "homepage": "https://github.com/rt2zz/redux-persist#readme",
  "ava": {
    "files": [
      "tests/**/*.spec.js"
    ],
    "require": [
      "@babel/polyfill",
      "@babel/register"
    ]
  },
  "devDependencies": {
    "@babel/cli": "^7.5.5",
    "@babel/core": "^7.5.5",
    "@babel/plugin-proposal-class-properties": "^7.5.5",
    "@babel/plugin-proposal-object-rest-spread": "^7.5.5",
    "@babel/plugin-transform-modules-commonjs": "^7.5.0",
    "@babel/polyfill": "^7.4.4",
    "@babel/preset-env": "^7.5.5",
    "@babel/preset-flow": "^7.0.0",
    "@babel/register": "^7.5.5",
    "@types/react": "^16.9.2",
    "ava": "^1.4.1",
    "babel-eslint": "^10.0.3",
    "cross-env": "^5.2.1",
    "dtslint": "^0.3.0",
    "eslint": "^4.16.0",
    "eslint-plugin-flowtype": "^2.42.0",
    "eslint-plugin-import": "^2.18.2",
    "flow-bin": "^0.98.1",
    "flow-copy-source": "^1.2.2",
    "husky": "^0.14.3",
    "lint-staged": "^6.1.0",
    "lodash": "^4.17.15",
    "prettier": "^1.18.2",
    "redux": "^4.0.4",
    "redux-mock-store": "^1.5.1",
    "rimraf": "^2.7.1",
    "rollup": "^0.55.3",
    "rollup-plugin-babel": "^4.3.3",
    "rollup-plugin-node-resolve": "^4.2.4",
    "rollup-plugin-replace": "^2.2.0",
    "rollup-plugin-uglify": "^3.0.0",
    "sinon": "^4.2.2",
    "storage-memory": "0.0.2"
  },
  "peerDependencies": {
    "redux": ">4.0.0"
  },
  "dependencies": {}
}
