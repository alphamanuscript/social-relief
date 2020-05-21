## App selector pipeline action

This action selects which Heroku and Firebase apps to use as deployment targets based on the pipeline is running against.

E.g. When pushing to `review1`, this will selects the review1 apps.


### Installation

- `npm install`
- `npm run package`

The `package` command compiles the action and its dependencies in a single file saved in `dist/index.js`. You should
run that command each time you update the action. The `dist/index.js` is checked-in to git and it's the script that
Github Actions will run.