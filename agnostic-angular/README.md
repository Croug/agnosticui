# Getting started

From monorepo top-level root directory, run following to install all dependencies

```shell
npm run
```

The dist library should already be built, but to do so do the following from
here in the `agnostic-angular` package's top-level directory:

```shell
npm run build:ag # this will output libs to /dist
```

Now fire up the example app (currently a sort of kitchen sink of coponents rendered
to the page):

```shell
npm run start # will serve at: http://localhost:4234/
```

### What to go look at

This set up leverages [nx](https://nx.dev/) and so the first place you should look to understand details about the setup is at: `agnostic-angular/angular.json` The components in the examples are being rendered in `agnostic-angular/apps/examples/src/app/app.component.html`.

## Storybook

```
npm run storybook
```
