const path = require('path');
const fs = require('fs-extra');
const childProcess = require('node:child_process');

const PREFIX = 'SEMREL-REACT-RELEASER';

let verified = false;

function getLernaPackages() {
  try {
    const stdout = childProcess.execSync('lerna ls --all --json').toString();
    return stdout;
  } catch (err) {
    console.log(err);
  }
}

let reactPackagePath;

async function verifyConditions(_pluginConfig, context) {
  const { logger } = context;

  const packageJson = require(path.join(context.cwd, 'package.json'));

  logger.info(PREFIX, packageJson.name);

  logger.info(PREFIX, getLernaPackages());

  reactPackagePath = JSON.parse(getLernaPackages()).find(
    (pkg) => pkg.name === `react-${packageJson.name}`
  ).location;

  if (!reactPackagePath) {
		verified = false
    return;
  }

  logger.info(PREFIX, reactPackagePath);
  logger.success(PREFIX, 'react package exists!');
  verified = true;
}

function success(_pluginConfig, context) {
	const {logger} = context

	if(!verified) {
		logger.info(PREFIX, 'Release is not verified!')
		return
	}

	logger.info(PREFIX, context)

	logger.info(PREFIX, 'react package path: ', reactPackagePath)

  const reactPackageJson = JSON.parse(fs.readFileSync(
    path.join(reactPackagePath, 'package.json'),
		{ encoding: 'utf8'}
  ));

	logger.info(PREFIX, reactPackageJson)

	logger.info(PREFIX, 'version', reactPackageJson.version)

	logger.info(PREFIX, 'next version', context.releases[0].version)

  reactPackageJson.version = context.releases[0].version;

	logger.info(PREFIX, 'next package', reactPackageJson)

  fs.writeFileSync(path.join(reactPackagePath, 'package.json'), JSON.stringify(reactPackageJson, null, 2));

	fs.copyFile(path.join(__dirname, '.npmrc'), path.join(reactPackagePath, '.npmrc'))

	logger.info(PREFIX, 'add .npmrc file to react package')

	logger.info(PREFIX, `${reactPackageJson.name} package updated to version: ${reactPackageJson.version}`)

	const stdout = childProcess.execSync('npm publish', {
		cwd: reactPackagePath
	}).toString()

	logger.info(PREFIX, stdout)
}

module.exports = {
  success,
  verifyConditions,
};
