const core = require('@actions/core');
const github = require('@actions/github');

function selectAppTargets () {
  const branch = github.context.ref;
  switch (branch) {
    case 'refs/heads/review1':
      return setOutputs('review1');
    case 'refs/heads/review2':
      return setOutputs('review2');
    case 'refs/heads/review3':
      return setOutputs('review3');
    case 'refs/heads/master':
      return setOutputs('staging');
    case 'refs/heads/release':
      return setOutputs('production');
    default:
      core.setFailed(`Invalid target deployment branch '${branch}'`);
  }
}

function setOutputs(appTarget) {
  const herokuApp = core.getInput(`heroku-${appTarget}`);
  const firebaseApp = core.getInput(`firebase-${appTarget}`);

  if (!herokuApp) {
    return core.setFailed(`Heroku app not specified for ${appTarget}`);
  }

  if (!firebaseApp) {
    return core.setFailed(`Firebase app not specified for ${appTarget}`);
  }

  core.setOutput('heroku-app', herokuApp);
  core.setOutput('firebase-app', firebaseApp);
}

selectAppTargets();
