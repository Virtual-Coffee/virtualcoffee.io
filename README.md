<p align="right"><a href="https://app.netlify.com/sites/virtual-coffee-io/deploys"><img alt="Netlify Status" src="https://api.netlify.com/api/v1/badges/ad849482-1158-4a45-bed5-14f3d17ae97d/deploy-status" /></a></div>

# [![Virtual Coffee](public/assets/images/virtual-coffee-full-tagline.svg)](https://virtualcoffee.io)

Virtual Coffee is a laid-back conversation with developers twice a week. It's the conversation that keeps going in slack. It's the online events that support developers at all stages of the journey. It's the place where you go to make friends who all just happen to be in tech.

Anyone can join! Whether you're just thinking about getting into tech or have been in it for decades.

We know that growth comes at all levels and that no matter what stage of the journey you're on, you can teach and learn.

So come with a question or a topic to discuss, ask for feedback on your portfolio, answer another developer's question, or just sit back and listen to others talk about tech.

Our mission is to form community, allow room for growth and mentorship at all levels, and to provide a safe space for everyone interested in tech.

Please take a moment to read our [Code of Conduct](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/master/CODE_OF_CONDUCT.md).

See you there!

# Working on the site:

- This site is built using [Remix](https://remix.run/).
- Check out our [CONTRIBUTING](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md) guideline to make contributions.
- If you're new to open source, check out our [Git & GitHub 101](https://virtualcoffee.io/resources/open-source/git-101) and [Contributor Guide](https://virtualcoffee.io/resources/open-source/contributor-guide) resources.

## Table of Contents:

- [Local Development Setup](#local-development-setup)
- [Commands](#commands)
- [Loading data](#loading-data)
- [Adding content](#adding-content)

## Local Development Setup

Steps to run the site locally for development or curiosity

### 1. Fork and clone the repository

Follow [these steps](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo) to create a fork of this repository and clone it to your local machine.

### 2. Navigate to the repo directory

If you have just run `git clone ...` , the next step would be to move into the cloned repo:

```shell
cd virtualcoffee.io
```

### 3. Install dependencies

This repo requires `node`, `pnpm`, and the [Netlify CLI](https://www.netlify.com/products/dev/) to get started.

#### Installing `node`:

The best way to install `node` is to [download the installer](https://nodejs.org/en/) from their site. This repo requires `node` version `16`, which is the latest version.

If you already have a different version of `node` installed, but don't want to update globally, you can install [a package called `nvm`](https://github.com/nvm-sh/nvm), which will allow you to easily switch `node` versions. Once you have `nvm` installed (or if you already have it installed), you can run `nvm use` in the main directory and it will install the proper version of `node`.

#### Installing `pnpm`:

`pnpm` is a package manager that is used to install the rest of our dependencies. You can install `pnpm` by following their [installation instructions](https://pnpm.io/installation). **Note:** if you are on a mac, you fall under the ["On POSIC Systems"](https://pnpm.io/installation#on-posix-systems) section.

Read more about `pnpm` [on their docs site](https://pnpm.io/motivation).

#### Installing the Netlify CLI

The [Netlify CLI](https://docs.netlify.com/cli/get-started) allows users to run a local version of the Netlify environment for local development. You can even [share your locally-running app with other people on the internet](https://docs.netlify.com/cli/get-started/#share-a-live-development-server)!!

To install:

```sh
pnpm add -g netlify-cli
```

If you have previously installed the Netlify CLI, you should update it to the latest version:

```sh
pnpm add -g netlify-cli@latest
```

#### Setting up your .env

Use the following command to create a local `.env` file. Then open the new file (`.env`) and adjust any settings that are needed.

```shell
cp .env.example .env
```

#### Installing package dependencies

Once you have `node`, `pnpm`, and the Netlify CLI installed, you're ready to install the local dependencies! Run the following command:

```shell
pnpm install
```

At this point you're ready to roll! Run the following command to get rolling!

```shell
pnpm dev
```

Read more about what `pnpm dev` does in the following section.

## Commands

The following commands are available for your use. Most of the time you'll only ever need `pnpm dev`.

### `pnpm dev`

```shell
pnpm dev
```

This is the only command you need to do normal local development.

Starts a local server and watches your source files for changes. Use this to preview local development.

Once you run this command, a local server is running at http://localhost:9000! Any changes you make to the src folder should also re-build the site and re-load your browser.

You should see something like 'Server now ready on http://localhost:9000' below, which means the watcher is waiting to build your awesome changes!

Use ctrl-c to quit the server when you're done.

---

**Note:**

Depending on the speed of your computer, you can get a `TimeoutError - Task timed out after 10.00 seconds` message when the localhost renders the home page (http://localhost:9000) on the browser.

If the feature you are working on is not on the home page (the newsletter or monthly challenges page, for example), you may still be able to load the page you need. After you see the notification of `Server now ready on http://localhost:9000`, go to your browser. Then add the path of the page you need (like `http://localhost:9000/newsletter` for the newsletter or `http://localhost:9000/monthlychallenges` for the monthly challenges page) to see the page.

---

`pnpm dev` actually runs three sub commands, which can be run independently if you wish:

- `pnpm dev:sass` - compiles sass styles found in `./styles`. When in dev mode will re-run when a file is changed. The files are compiled to the `./tmp` directory to be processed by the next step.
- `pnpm dev:css` - processes css files using [PostCSS](https://postcss.org/). The resulting files are saved in `./app/styles`
- `pnpm dev:remix` - starts up the local Netlify dev environment and starts the Remix server.

### `pnpm build`

```shell
pnpm build
```

Builds a production-ready version of the site. This is what Netlify uses to build our site.

`pnpm build` actually runs three sub commands, which can be run independently if you wish:

- `pnpm build:sass` - compiles sass styles found in `./styles`. The files are compiled to the `./tmp` directory to be processed by the next step.
- `pnpm build:css` - processes css files using [PostCSS](https://postcss.org/). The resulting files are saved in `./app/styles`
- `pnpm build:remix` - compiles everything needed to run the site for production.

### `pnpm format`

```shell
pnpm format
```

Runs [Prettier](https://prettier.io/) on all of our files. This happens automatically via [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged), so there's usually no need to run this manually.

### `pnpm lint`

```shell
pnpm lint
```

Runs [ESLint](https://eslint.org/) on all of our files, so you can check for errors or warnings. This happens automatically at build time.

## Loading data

A lot of the data loaded on the site is from APIs that require private keys or tokens. Unfortunately we can't publish these or distribute them too widely.

All of the data points have mock data that is used if the required API key isn't present, so contributors should be able to make UX-related changes without needing them.

If you'd like to work on a feature that requires an API key, please reach out to a maintainer and we can probably get that going.

## Adding content

### Resources

Our [VC Resources](https://virtualcoffee.io/resources) are creating using [MDX](https://mdxjs.com/). MDX is basically a combination of Markdown and React.

Any files added to `app/routes/__frontend/resources` will be automatically loaded and added to the appropriate index page.

A good way to start adding a new page would be to copy one of the existing pages, then edit the details and content.

### Newsletters

The newsletters (for now) are simply `jsx` files, and can be found in `app/routes/__frontend/newsletter/issues`.

When you add a new issue, **make sure to add it to the index**. Here's how:

- Open `app/data/newsletters.js`
- `import` the new issue
- Add the new issue to the `newsletters` array.

So, if you have created `app/routes/__frontend/newsletter/issues/2022-03.jsx`:

```diff
+ import { handle as issue202203 } from '~/routes/__frontend/newsletter/issues/2022-03';
import { handle as issue202202 } from '~/routes/__frontend/newsletter/issues/2022-02';
import { handle as issue202201 } from '~/routes/__frontend/newsletter/issues/2022-01';

const newsletters = [
+ 	{ handleData: issue202203, slug: '2022-03' },
	{ handleData: issue202202, slug: '2022-02' },
	{ handleData: issue202201, slug: '2022-01' },
];
```

### Monthly Challenges

Every month, our monthly challenge page will need to move the current challenge to the main portion of the list, and add the new challenge to the current challenge section.

To make the updates, go to `app/routes/__frontend/monthlychallenges/index.tsx`
