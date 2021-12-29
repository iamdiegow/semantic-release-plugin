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

async function verifyConditions(pluginConfig, context) {
  const { logger } = context;

  const packageJson = require(path.join(context.cwd, 'package.json'));

  logger.info(PREFIX, packageJson.name);

  logger.info(PREFIX, getLernaPackages());

  reactPackagePath = JSON.parse(getLernaPackages()).find(
    (pkg) => pkg.name === `react-${packageJson.name}`
  ).location;

  if (!reactPackagePath) {
    return;
  }

  logger.info(PREFIX, reactPackagePath);
  logger.success(PREFIX, 'react package exists!');

  // const reactPackageExists = fs.existsSync(reactPackagePath);

  verified = true;
}

function success(pluginConfig, context) {
  const reactPackageJson = fs.readFileSync(
    path.join(reactPackagePath, 'package.json')
  );

  reactPackageJson.version = context.nextRelease.version;

  fs.writeFileSync(path.join(reactPackagePath, 'package.json'), reactPackageJson);
}

module.exports = {
  success,
  verifyConditions,
};
