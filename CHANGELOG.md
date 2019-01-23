# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- [PR #974](https://github.com/rt2zz/redux-persist/pull/974) **Add correct PersistGate defaultProps to support newer flow versions.** Adds `children` to defaultProps in `PersistGate` component and removes the optional (`?`) flag in order to be compatible with flow type checking (more explanation can be found in [this flow issue](facebook/flow#1660)). Fixes [#953](https://github.com/rt2zz/redux-persist/issues/953)
- [PR #949](https://github.com/rt2zz/redux-persist/pull/949) **Allow onWriteFail
to be passed in config.** The value should be a function to be called in the
case a write fails (i.e. because the disk it out of space).
- **Add Community section to README.** Add link to Reactiflux #redux-persist
channel. Add blog articles about redux-persist from the community.

## 0.2.0 through 5.10.0 - 2015-07-24 through 2018-06-05
See notes on [GitHub releases page](https://github.com/rt2zz/redux-persist/releases)

[Unreleased]: https://github.com/olivierlacan/keep-a-changelog/compare/v5.10.0...HEAD
[0.2.0 through 5.10.0]: See notes on [GitHub releases page](https://github.com/rt2zz/redux-persist/releases)
