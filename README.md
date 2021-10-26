# [![Virtual Coffee](src/assets/images/virtual-coffee-full-tagline.svg)](https://virtualcoffee.io)

Virtual Coffee is a laid-back conversation with developers twice a week. It's the conversation that keeps going in slack. It's the online events that support developers at all stages of the journey. It's the place where you go to make friends who all just happen to be in tech.

Anyone can join! Whether you're just thinking about getting into tech or have been in it for decades.

We know that growth comes at all levels and that no matter what stage of the journey you're on, you can teach and learn.

So come with a question or a topic to discuss, ask for feedback on your portfolio, answer another developer's question, or just sit back and listen to others talk about tech.

Our mission is to form community, allow room for growth and mentorship at all levels, and to provide a safe space for everyone interested in tech.

Please take a moment to read our [Code of Conduct](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/master/CODE_OF_CONDUCT.md)

See you there!

# Working on the site:

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

This repo requires `node` and `yarn` to get started.

#### Installing `node`:

The best way to install `node` is to [download the installer](https://nodejs.org/en/) from their site. This repo requires `node` version `16`, which is the latest version.

If you already have a different version of `node` installed, but don't want to update globally, you can install [a package called `nvm`](https://github.com/nvm-sh/nvm), which will allow you to easily switch `node` versions. Once you have `nvm` installed (or if you already have it installed), you can run `nvm use` in the main directory and it will install the proper version of `node`.

#### Installing `yarn`:

`yarn` is a package manager that is used to install the rest of our dependencies. You can install `yarn` by running the following command:

```shell
npm install -g yarn
```

Read more about `yarn` [on their docs site](https://yarnpkg.com/getting-started/install).

Once you have `yarn` installed, you're ready to install the local dependencies! Run the following command:

```shell
yarn
```

At this point you're ready to roll! The following commands are available:

### `yarn start`

```shell
yarn start
```

This is the only command you need to do normal local development.

Starts a local server and watches the `src` directory for changes. Use this to preview local development.

Once you run this command, a local server is running at http://localhost:9000! Any changes you make to the src folder should also re-build the site and re-load your browser.

You should see 'Waiting...' below, which means the watcher is waiting to build your awesome changes!

Use ctrl-c to quit the server when you're done.

## Build Commands

The following commands are for building production-ready versions of the site. If you're interested in seeing what they look like on your machine, feel free to run them! But they are not needed for normal local development.

### `yarn build`

```shell
yarn build
```

Builds a production-ready version of the site. This is what Netlify uses to build our site.

### `yarn build-preview`

```shell
yarn build-preview
```

If you'd like to see a preview of the production build, use this command to build the site and start up a server at http://localhost:9000. To see any subsequent changes, you can leave this server running, but you'll have to run `yarn build` again in another console tab.

### PWA and Templates using Forms

The site can be installed as a Progressive Web Application (PWA), which includes strategic caching of resources.  Certain pages such as those including forms and destination pages for forms should not be cached. A list of these is supplied to the `pluginPWA` plugin in our `.eleventy.js` file. If you add any such form files for form destination files in development, they should probably be added to this list.

### Heads Up

If you have problems in VS Code related to `.njk` files, you may need to [reconfigure your language settings](https://github.com/Virtual-Coffee/virtualcoffee.io/issues/176) after working with this repo.
