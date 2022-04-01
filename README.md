<p align="right"><a href="https://app.netlify.com/sites/virtual-coffee-io/deploys"><img alt="Netlify Status" src="https://api.netlify.com/api/v1/badges/ad849482-1158-4a45-bed5-14f3d17ae97d/deploy-status" /></a></div>

# [![Virtual Coffee](src/assets/images/virtual-coffee-full-tagline.svg)](https://virtualcoffee.io)

Virtual Coffee is a laid-back conversation with developers twice a week. It's the conversation that keeps going in slack. It's the online events that support developers at all stages of the journey. It's the place where you go to make friends who all just happen to be in tech.

Anyone can join! Whether you're just thinking about getting into tech or have been in it for decades.

We know that growth comes at all levels and that no matter what stage of the journey you're on, you can teach and learn.

So come with a question or a topic to discuss, ask for feedback on your portfolio, answer another developer's question, or just sit back and listen to others talk about tech.

Our mission is to form community, allow room for growth and mentorship at all levels, and to provide a safe space for everyone interested in tech.

Please take a moment to read our [Code of Conduct](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/master/CODE_OF_CONDUCT.md)

See you there!

# Working on the site:

This site is built using [Remix](https://remix.run/).

## Local Development

Steps to run the site locally for development or curiosity

### 1. Fork and clone the repository

Follow [these steps](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo) to create a fork of this repository and clone it to your local machine.

### 2. Navigate to the repo directory

If you have just run `git clone ...` , the next step would be to move into the cloned repo:

```shell
cd virtualcoffee.io
```

### 3. Install dependencies

This repo requires `node`, `yarn`, and the [Netlify CLI](https://www.netlify.com/products/dev/) to get started.

#### Installing `node`:

The best way to install `node` is to [download the installer](https://nodejs.org/en/) from their site. This repo requires `node` version `16`, which is the latest version.

If you already have a different version of `node` installed, but don't want to update globally, you can install [a package called `nvm`](https://github.com/nvm-sh/nvm), which will allow you to easily switch `node` versions. Once you have `nvm` installed (or if you already have it installed), you can run `nvm use` in the main directory and it will install the proper version of `node`.

#### Installing `yarn`:

`yarn` is a package manager that is used to install the rest of our dependencies. You can install `yarn` by running the following command:

```shell
npm install -g yarn
```

Read more about `yarn` [on their docs site](https://yarnpkg.com/getting-started/install).

#### Installing the Netlify CLI

The [Netlify CLI](https://docs.netlify.com/cli/get-started) allows users to run a local version of the Netlify environment for local development. You can even [share your locally-running app with other people on the internet](https://docs.netlify.com/cli/get-started/#share-a-live-development-server)!!

To install:

```sh
npm i -g netlify-cli
```

If you have previously installed the Netlify CLI, you should update it to the latest version:

```sh
npm i -g netlify-cli@latest
```

#### Setting up your .env

Use the following command to create a local `.env` file. Then open the new file (`.env`) and adjust any settings that are needed.

```shell
cp .env.example .env
```

#### Installing package dependencies

Once you have `node`, `yarn`, and the Netlify CLI installed, you're ready to install the local dependencies! Run the following command:

```shell
yarn
```

At this point you're ready to roll! The following commands are available:

### `yarn dev`

```shell
yarn dev
```

This is the only command you need to do normal local development.

Starts a local server and watches your source files for changes. Use this to preview local development.

Once you run this command, a local server is running at http://localhost:9000! Any changes you make to the src folder should also re-build the site and re-load your browser.

You should see something like 'Server now ready on http://localhost:9000' below, which means the watcher is waiting to build your awesome changes!

Use ctrl-c to quit the server when you're done.

## Build Commands

The following commands are for building production-ready versions of the site. If you're interested in seeing what they look like on your machine, feel free to run them! But they are not needed for normal local development.

### `yarn build`

```shell
yarn build
```

Builds a production-ready version of the site. This is what Netlify uses to build our site.

## Loading data

A lot of the data loaded on the site is from APIs that require private keys or tokens. Unfortunately we can't publish these or distribute them too widely.

All of the data points have mock data that is used if the required API key isn't present, so contributors should be able to make UX-related changes without needing them.

If you'd like to work on a feature that requires an API key, please reach out to a maintainer and we can probably get that going.

## Adding content

### Resources

Our [VC Resources](https://virtualcoffee.io/resources) are creating using [MDX](https://mdxjs.com/). MDX is basically a combination of Markdown and React.

Any files added to `app/routes/resources` will be automatically loaded and added to the appropriate index page.

A good way to start adding a new page would be to copy one of the existing pages, then edit the details and content.

### Newsletters

The newsletters (for now) are simply `jsx` files, and can be found in `app/routes/newsletter/issues`.

When you add a new issue, **make sure to add it to the index**. Here's how:

- Open `app/data/newsletters.js`
- `import` the new issue
- Add the new issue to the `newsletters` array.

So, if you have created `

```diff
+ import { handle as issue202203 } from '~/routes/newsletter/issues/2022-03';
import { handle as issue202202 } from '~/routes/newsletter/issues/2022-02';
import { handle as issue202201 } from '~/routes/newsletter/issues/2022-01';

const newsletters = [
+ 	{ handleData: issue202203, slug: '2022-03' },
	{ handleData: issue202202, slug: '2022-02' },
	{ handleData: issue202201, slug: '2022-01' },
];
```

### Monthly Challenges

The monthly challenges (for now) are simply `jsx` files, and can be found in `app/routes/monthlychallenges`.

When you add a new challenge, **make sure to add it to the index**. Here's how:

- Open `app/data/monthlyChallenges/getChallenges.js`
- `import` the new challenge
- Add the new challenge to the `challenges` array.

```diff
+ import { handle as apr2022 } from '~/routes/monthlychallenges/apr-2022';
import { handle as mar2022 } from '~/routes/monthlychallenges/mar-2022';
import { handle as feb2022 } from '~/routes/monthlychallenges/feb-2022';

const challenges = [
+ 	{ handleData: apr2022, slug: 'apr-2022' },
	{ handleData: mar2022, slug: 'mar-2022' },
	{ handleData: feb2022, slug: 'feb-2022' },
];
```
