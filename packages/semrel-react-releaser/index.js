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

  const reactPackageJson = fs.readFileSync(
    path.join(reactPackagePath, 'package.json')
  );

  reactPackageJson.version = context.releases[0].version;

  fs.writeFileSync(path.join(reactPackagePath, 'package.json'), reactPackageJson);

	logger.info(PREFIX, `${reactPackageJson.name} package updated to version: ${version}`)
}

module.exports = {
  success,
  verifyConditions,
};
