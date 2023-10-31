<p align="right"><a href="https://app.netlify.com/sites/virtual-coffee-io/deploys"><img alt="Netlify Status" src="https://api.netlify.com/api/v1/badges/ad849482-1158-4a45-bed5-14f3d17ae97d/deploy-status" /></a></div>
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-42-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

# [![Virtual Coffee](public/assets/images/virtual-coffee-full-tagline.svg)](https://virtualcoffee.io)

Virtual Coffee is a laid-back conversation with developers twice a week. It's the conversation that keeps going in slack. It's the online events that support developers at all stages of the journey. It's the place where you go to make friends who all just happen to be in tech.

Anyone can join! Whether you're just thinking about getting into tech or have been in it for decades.

We know that growth comes at all levels and that no matter what stage of the journey you're on, you can teach and learn.

So come with a question or a topic to discuss, ask for feedback on your portfolio, answer another developer's question, or just sit back and listen to others talk about tech.

Our mission is to form community, allow room for growth and mentorship at all levels, and to provide a safe space for everyone interested in tech.

Please take a moment to read our [Code of Conduct](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CODE_OF_CONDUCT.md).

See you there!

# Working on the site:

- This site is built using [Remix](https://remix.run/).
- Check out our [CONTRIBUTING](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md) guideline to make contributions.
- If you're new to open source, check out our [Git & GitHub 101](https://virtualcoffee.io/resources/developer-resources/open-source/git-101) and [Contributor Guide](https://virtualcoffee.io/resources/developer-resources/open-source/contributor-guide) resources.

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

The best way to install `node` is to [download the installer](https://nodejs.org/en/) from their site. This repo requires `node` version `18.16`, which is the latest [LTS version](https://nodejs.dev/en/about/releases/).

If you already have a different version of `node` installed, but don't want to update globally, you can install [a package called `nvm`](https://github.com/nvm-sh/nvm), which will allow you to easily switch `node` versions. Once you have `nvm` installed (or if you already have it installed), you can run `nvm use` in the main directory and it will install the proper version of `node`.

#### Installing `pnpm`:

`pnpm` is a package manager that is used to install the rest of our dependencies.

Read more about `pnpm` [on their docs site](https://pnpm.io/motivation).

The best way to install `pnpm` for this project is by using [Corepack](https://nodejs.org/api/corepack.html), a new feature bundled with Node.

Install pnpm via corepack with the following commands:

```sh
corepack enable
corepack prepare
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

Our [VC Resources](https://virtualcoffee.io/resources) are created using [MDX](https://mdxjs.com/). MDX is basically a combination of Markdown and React.

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

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://danott.dev/"><img src="https://avatars.githubusercontent.com/u/360261?v=4?s=100" width="100px;" alt="Dan Ott"/><br /><sub><b>Dan Ott</b></sub></a><br /><a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3Adanieltott" title="Bug reports">🐛</a> <a href="#a11y-danieltott" title="Accessibility">️️️️♿️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://linkfree.eddiehub.io/CBID2"><img src="https://avatars.githubusercontent.com/u/105683440?v=4?s=100" width="100px;" alt="Christine Belzie"/><br /><sub><b>Christine Belzie</b></sub></a><br /><a href="https://github.com/Virtual-Coffee/virtualcoffee.io/commits?author=CBID2" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://bekahhw.github.io/"><img src="https://avatars.githubusercontent.com/u/34313413?v=4?s=100" width="100px;" alt="BekahHW"/><br /><sub><b>BekahHW</b></sub></a><br /><a href="#content-BekahHW" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://adiati.com/"><img src="https://avatars.githubusercontent.com/u/45172775?v=4?s=100" width="100px;" alt="Ayu Adiati"/><br /><sub><b>Ayu Adiati</b></sub></a><br /><a href="#content-adiati98" title="Content">🖋</a> <a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3Aadiati98" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tkshill"><img src="https://avatars.githubusercontent.com/u/13292886?v=4?s=100" width="100px;" alt="Kirk Shillingford"/><br /><sub><b>Kirk Shillingford</b></sub></a><br /><a href="#content-tkshill" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://meghangutshall.com/"><img src="https://avatars.githubusercontent.com/u/37842352?v=4?s=100" width="100px;" alt="Meg Gutshall"/><br /><sub><b>Meg Gutshall</b></sub></a><br /><a href="#content-meg-gutshall" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://dominicduffin.uk/"><img src="https://avatars.githubusercontent.com/u/26224873?v=4?s=100" width="100px;" alt="Dominic Duffin"/><br /><sub><b>Dominic Duffin</b></sub></a><br /><a href="#content-dominicduffin1" title="Content">🖋</a> <a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3Adominicduffin1" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://christopherleejarvis.com/"><img src="https://avatars.githubusercontent.com/u/10702993?v=4?s=100" width="100px;" alt="Chris Jarvis"/><br /><sub><b>Chris Jarvis</b></sub></a><br /><a href="#content-ClJarvis" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://abbeyperini.dev/"><img src="https://avatars.githubusercontent.com/u/68071056?v=4?s=100" width="100px;" alt="Abbey Perini"/><br /><sub><b>Abbey Perini</b></sub></a><br /><a href="#content-abbeyperini" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/aishwarya-mali"><img src="https://avatars.githubusercontent.com/u/43086476?v=4?s=100" width="100px;" alt="Aishwarya Mali"/><br /><sub><b>Aishwarya Mali</b></sub></a><br /><a href="#content-aishwarya-mali" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://joekarow.dev/"><img src="https://avatars.githubusercontent.com/u/58997957?v=4?s=100" width="100px;" alt="Joe Karow"/><br /><sub><b>Joe Karow</b></sub></a><br /><a href="#content-JoeKarow" title="Content">🖋</a> <a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3AJoeKarow" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://nickyt.co/"><img src="https://avatars.githubusercontent.com/u/833231?v=4?s=100" width="100px;" alt="Nick Taylor"/><br /><sub><b>Nick Taylor</b></sub></a><br /><a href="#content-nickytonline" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://lsparlin.dev/"><img src="https://avatars.githubusercontent.com/u/1904364?v=4?s=100" width="100px;" alt="Lewis Sparlin"/><br /><sub><b>Lewis Sparlin</b></sub></a><br /><a href="#content-lsparlin" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/redapy"><img src="https://avatars.githubusercontent.com/u/85396770?v=4?s=100" width="100px;" alt="Reda Baha"/><br /><sub><b>Reda Baha</b></sub></a><br /><a href="#content-redapy" title="Content">🖋</a> <a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3Aredapy" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.yhaynes.com/"><img src="https://avatars.githubusercontent.com/u/12980710?v=4?s=100" width="100px;" alt="Yolanda Haynes"/><br /><sub><b>Yolanda Haynes</b></sub></a><br /><a href="#content-YolandaHaynes" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/kldickenson/"><img src="https://avatars.githubusercontent.com/u/2073648?v=4?s=100" width="100px;" alt="Karen Dickenson"/><br /><sub><b>Karen Dickenson</b></sub></a><br /><a href="#content-kldickenson" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://alexcurtisslep.com/"><img src="https://avatars.githubusercontent.com/u/49458917?v=4?s=100" width="100px;" alt="Alex Curtis-Slep"/><br /><sub><b>Alex Curtis-Slep</b></sub></a><br /><a href="#content-AlexVCS" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://jessicawilkins.dev/"><img src="https://avatars.githubusercontent.com/u/67210629?v=4?s=100" width="100px;" alt="Jessica Wilkins "/><br /><sub><b>Jessica Wilkins </b></sub></a><br /><a href="#content-jdwilkin4" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://toddl.dev/"><img src="https://avatars.githubusercontent.com/u/40549031?v=4?s=100" width="100px;" alt="Todd Libby"/><br /><sub><b>Todd Libby</b></sub></a><br /><a href="#content-colabottles" title="Content">🖋</a> <a href="#a11y-colabottles" title="Accessibility">️️️️♿️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/secondl1ght"><img src="https://avatars.githubusercontent.com/u/85003930?v=4?s=100" width="100px;" alt="secondl1ght"/><br /><sub><b>secondl1ght</b></sub></a><br /><a href="#content-secondl1ght" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://andreamartz.dev/"><img src="https://avatars.githubusercontent.com/u/14165788?v=4?s=100" width="100px;" alt="Andrea Martz"/><br /><sub><b>Andrea Martz</b></sub></a><br /><a href="#content-andreamartz" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/MattyMc"><img src="https://avatars.githubusercontent.com/u/1302166?v=4?s=100" width="100px;" alt="Matt McInnis (he/him)"/><br /><sub><b>Matt McInnis (he/him)</b></sub></a><br /><a href="#content-MattyMc" title="Content">🖋</a> <a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3AMattyMc" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/JesseRWeigel"><img src="https://avatars.githubusercontent.com/u/11077930?v=4?s=100" width="100px;" alt="Jesse R Weigel"/><br /><sub><b>Jesse R Weigel</b></sub></a><br /><a href="#content-JesseRWeigel" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://mikerogers.io/"><img src="https://avatars.githubusercontent.com/u/325384?v=4?s=100" width="100px;" alt="Mike Rogers"/><br /><sub><b>Mike Rogers</b></sub></a><br /><a href="#content-MikeRogers0" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sadiejay"><img src="https://avatars.githubusercontent.com/u/19538219?v=4?s=100" width="100px;" alt="Sadie"/><br /><sub><b>Sadie</b></sub></a><br /><a href="#content-sadiejay" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://vicvijayakumar.com/"><img src="https://avatars.githubusercontent.com/u/205796?v=4?s=100" width="100px;" alt="Vic Vijayakumar"/><br /><sub><b>Vic Vijayakumar</b></sub></a><br /><a href="#content-needcaffeine" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.jenkens.dev/"><img src="https://avatars.githubusercontent.com/u/25398021?v=4?s=100" width="100px;" alt="Jen Kennedy"/><br /><sub><b>Jen Kennedy</b></sub></a><br /><a href="#content-jenkens-dev" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://luciacerchie.dev/blog"><img src="https://avatars.githubusercontent.com/u/54046179?v=4?s=100" width="100px;" alt="Lucia Cerchie"/><br /><sub><b>Lucia Cerchie</b></sub></a><br /><a href="#content-Cerchie" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://pedaars.co.uk/"><img src="https://avatars.githubusercontent.com/u/11647950?v=4?s=100" width="100px;" alt="Aaron Pedwell"/><br /><sub><b>Aaron Pedwell</b></sub></a><br /><a href="#content-pedaars" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/klezi10"><img src="https://avatars.githubusercontent.com/u/74952593?v=4?s=100" width="100px;" alt="Klesta"/><br /><sub><b>Klesta</b></sub></a><br /><a href="#content-klezi10" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bogdaaamn"><img src="https://avatars.githubusercontent.com/u/22895284?v=4?s=100" width="100px;" alt="Bogdan Covrig"/><br /><sub><b>Bogdan Covrig</b></sub></a><br /><a href="#content-bogdaaamn" title="Content">🖋</a> <a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3Abogdaaamn" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/carmenkolohe"><img src="https://avatars.githubusercontent.com/u/69023218?v=4?s=100" width="100px;" alt="Carmen"/><br /><sub><b>Carmen</b></sub></a><br /><a href="#content-carmenkolohe" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://https//gwn-ws.com"><img src="https://avatars.githubusercontent.com/u/1579750?v=4?s=100" width="100px;" alt="Michael Honey-Arcement"/><br /><sub><b>Michael Honey-Arcement</b></sub></a><br /><a href="#content-chaos986" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.mikestreety.co.uk/"><img src="https://avatars.githubusercontent.com/u/354085?v=4?s=100" width="100px;" alt="Mike Street"/><br /><sub><b>Mike Street</b></sub></a><br /><a href="#content-mikestreety" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/piotrszymaniec"><img src="https://avatars.githubusercontent.com/u/5377285?v=4?s=100" width="100px;" alt="Piotrek"/><br /><sub><b>Piotrek</b></sub></a><br /><a href="#content-piotrszymaniec" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://rebeccakeyphd.com/"><img src="https://avatars.githubusercontent.com/u/47927958?v=4?s=100" width="100px;" alt="Rebecca Key"/><br /><sub><b>Rebecca Key</b></sub></a><br /><a href="#content-rek990" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://taiwodevlab.hashnode.dev/"><img src="https://avatars.githubusercontent.com/u/25867172?v=4?s=100" width="100px;" alt="Yusuf Taiwo Hassan"/><br /><sub><b>Yusuf Taiwo Hassan</b></sub></a><br /><a href="#content-teezzan" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://brandonmichaelbrown.com/"><img src="https://avatars.githubusercontent.com/u/42486126?v=4?s=100" width="100px;" alt="Brandon Brown"/><br /><sub><b>Brandon Brown</b></sub></a><br /><a href="#content-brandonbrown4792" title="Content">🖋</a> <a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3Abrandonbrown4792" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/surajrpanchal"><img src="https://avatars.githubusercontent.com/u/25049536?v=4?s=100" width="100px;" alt="Suraj Panchal"/><br /><sub><b>Suraj Panchal</b></sub></a><br /><a href="#content-surajrpanchal" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://vanessapoppe.me/"><img src="https://avatars.githubusercontent.com/u/46777560?v=4?s=100" width="100px;" alt="Vanessa "/><br /><sub><b>Vanessa </b></sub></a><br /><a href="#content-vanessacor" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://adamabundis.xyz/"><img src="https://avatars.githubusercontent.com/u/21162229?v=4?s=100" width="100px;" alt="Adam Abundis"/><br /><sub><b>Adam Abundis</b></sub></a><br /><a href="#content-abuna1985" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/iotalex"><img src="https://avatars.githubusercontent.com/u/59321539?v=4?s=100" width="100px;" alt="Alexander Batenhorst"/><br /><sub><b>Alexander Batenhorst</b></sub></a><br /><a href="#content-iotalex" title="Content">🖋</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
