// @noflow
const fs = require('fs');
const {promisify} = require('util');

const readDir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);

const flowProxy = file => `
// @flow
export * from '../src/${file}'
export { default } from '../src/${file}'
`

async function processDir(dir) {
	const files = (await readDir(dir)).filter(file => !/^chunk/.test(file) && !/\.native\.js$/.test(file))
	await files.map(file => writeFile(`${dir}/${file.replace('.js', '.flow.js')}`, flowProxy(file)))
}

Promise.all(['lib', 'es'].map(processDir)).then(() => console.log('flow files generated!'))
