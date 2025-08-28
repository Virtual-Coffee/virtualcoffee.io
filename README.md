<div align="right"><a href="https://app.netlify.com/sites/virtual-coffee-io/deploys"><img alt="Netlify Status" src="https://api.netlify.com/api/v1/badges/ad849482-1158-4a45-bed5-14f3d17ae97d/deploy-status" /></a>

<!-- prettier-ignore-start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-194-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- prettier-ignore-end -->

</div>

# [![Virtual Coffee](public/assets/images/virtual-coffee-full-tagline.svg)](https://virtualcoffee.io)

Virtual Coffee is a laid-back conversation with developers twice a week. It's the conversation that keeps going in slack. It's the online events that support developers at all stages of the journey. It's the place where you go to make friends who all just happen to be in tech.

Anyone can join! Whether you're just thinking about getting into tech or have been in it for decades.

We know that growth comes at all levels and that no matter what stage of the journey you're on, you can teach and learn.

So come with a question or a topic to discuss, ask for feedback on your portfolio, answer another developer's question, or just sit back and listen to others talk about tech.

Our mission is to form community, allow room for growth and mentorship at all levels, and to provide a safe space for everyone interested in tech.

Please take a moment to read our [Code of Conduct](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CODE_OF_CONDUCT.md).

See you there!

# Working on the site:

- This site is built using [Next.js](https://nextjs.org/).
- Check out our [CONTRIBUTING](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md) guideline to make contributions.
- If you're new to open source, check out our [Git & GitHub 101](https://virtualcoffee.io/resources/developer-resources/open-source/git-101) and [Contributor Guide](https://virtualcoffee.io/resources/developer-resources/open-source/contributor-guide) resources.

## Table of Contents:

- [Local Development Setup](#local-development-setup)
- [Commands](#commands)
- [Loading data](#loading-data)
- [Adding content](#adding-content)
- [Contributors](#contributors-)

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

The best way to install `node` is to [download the installer](https://nodejs.org/en/) from their site. This repo requires node version 20.17.

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

Use `ctrl-c` to quit the server when you're done.

### `pnpm build`

```shell
pnpm build
```

Builds a production-ready version of the site. This is what Netlify uses to build our site.

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

Any files added to `src/content/resources` will be automatically loaded and added to the appropriate index page.

A good way to start adding a new page would be to copy one of the existing pages, then edit the details and content.


### Monthly Challenges

Every month, our monthly challenge page will need to move the current challenge to the main portion of the list, and add the new challenge to the current challenge section.

To make the updates, go to `src/app/monthlychallenges/page.tsx`

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://pedaars.co.uk/"><img src="https://avatars.githubusercontent.com/u/11647950?v=4?s=100" width="100px;" alt="Aaron Pedwell"/><br /><sub><b>Aaron Pedwell</b></sub></a><br /><a href="#content-pedaars" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://abbeyperini.dev/"><img src="https://avatars.githubusercontent.com/u/68071056?v=4?s=100" width="100px;" alt="Abbey Perini"/><br /><sub><b>Abbey Perini</b></sub></a><br /><a href="#content-abbeyperini" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://adamabundis.xyz/"><img src="https://avatars.githubusercontent.com/u/21162229?v=4?s=100" width="100px;" alt="Adam Abundis"/><br /><sub><b>Adam Abundis</b></sub></a><br /><a href="#content-abuna1985" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kingahmedino"><img src="https://avatars.githubusercontent.com/u/47981052?v=4?s=100" width="100px;" alt="Ahmed Mohammed"/><br /><sub><b>Ahmed Mohammed</b></sub></a><br /><a href="#content-kingahmedino" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/awildstone"><img src="https://avatars.githubusercontent.com/u/11568530?v=4?s=100" width="100px;" alt="Aimee Wildstone"/><br /><sub><b>Aimee Wildstone</b></sub></a><br /><a href="#content-awildstone" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/aishat-ajose"><img src="https://avatars.githubusercontent.com/u/58638871?v=4?s=100" width="100px;" alt="Aishat Ajose"/><br /><sub><b>Aishat Ajose</b></sub></a><br /><a href="#content-aishat-ajose" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/charlieintech"><img src="https://avatars.githubusercontent.com/u/97811982?v=4?s=100" width="100px;" alt="Aishe Ibrahim"/><br /><sub><b>Aishe Ibrahim</b></sub></a><br /><a href="#content-charlieintech" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/aishwarya-mali"><img src="https://avatars.githubusercontent.com/u/43086476?v=4?s=100" width="100px;" alt="Aishwarya Mali"/><br /><sub><b>Aishwarya Mali</b></sub></a><br /><a href="#content-aishwarya-mali" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/AlexCovone"><img src="https://avatars.githubusercontent.com/u/98838825?v=4?s=100" width="100px;" alt="Alex Covone"/><br /><sub><b>Alex Covone</b></sub></a><br /><a href="#content-AlexCovone" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://alexcurtisslep.com/"><img src="https://avatars.githubusercontent.com/u/49458917?v=4?s=100" width="100px;" alt="Alex Curtis-Slep"/><br /><sub><b>Alex Curtis-Slep</b></sub></a><br /><a href="#content-AlexVCS" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/iotalex"><img src="https://avatars.githubusercontent.com/u/59321539?v=4?s=100" width="100px;" alt="Alexander Batenhorst"/><br /><sub><b>Alexander Batenhorst</b></sub></a><br /><a href="#content-iotalex" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/aliaquintero"><img src="https://avatars.githubusercontent.com/u/91979003?v=4?s=100" width="100px;" alt="Alia Quintero"/><br /><sub><b>Alia Quintero</b></sub></a><br /><a href="#content-aliaquintero" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://amyshackles.com/"><img src="https://avatars.githubusercontent.com/u/13436429?v=4?s=100" width="100px;" alt="Amy Shackles"/><br /><sub><b>Amy Shackles</b></sub></a><br /><a href="#content-AmyShackles" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://andreamartz.dev/"><img src="https://avatars.githubusercontent.com/u/14165788?v=4?s=100" width="100px;" alt="Andrea Martz"/><br /><sub><b>Andrea Martz</b></sub></a><br /><a href="#content-andreamartz" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Andrew-Bush"><img src="https://avatars.githubusercontent.com/u/18130929?v=4?s=100" width="100px;" alt="Andrew Bush"/><br /><sub><b>Andrew Bush</b></sub></a><br /><a href="#content-Andrew-Bush" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://muckitymuck.com/"><img src="https://avatars.githubusercontent.com/u/6893378?v=4?s=100" width="100px;" alt="Andrew Goldstein"/><br /><sub><b>Andrew Goldstein</b></sub></a><br /><a href="#content-muckitymuck" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ARodriguezHacks"><img src="https://avatars.githubusercontent.com/u/22532097?v=4?s=100" width="100px;" alt="Angie Rodriguez"/><br /><sub><b>Angie Rodriguez</b></sub></a><br /><a href="#content-ARodriguezHacks" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://annakimdev.netlify.app/"><img src="https://avatars.githubusercontent.com/u/102593061?v=4?s=100" width="100px;" alt="Anna Kim"/><br /><sub><b>Anna Kim</b></sub></a><br /><a href="#content-annakimdev" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/anshumanSathua"><img src="https://avatars.githubusercontent.com/u/95961359?v=4?s=100" width="100px;" alt="Anshuman Sathua"/><br /><sub><b>Anshuman Sathua</b></sub></a><br /><a href="#content-anshumanSathua" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/anthony-beckford-32b74132/"><img src="https://avatars.githubusercontent.com/u/28709850?v=4?s=100" width="100px;" alt="Anthony Beckford"/><br /><sub><b>Anthony Beckford</b></sub></a><br /><a href="#content-ABeck617" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/doleraj"><img src="https://avatars.githubusercontent.com/u/8129335?v=4?s=100" width="100px;" alt="Arthur Doler"/><br /><sub><b>Arthur Doler</b></sub></a><br /><a href="#content-doleraj" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/arvin-fernandez-a98bb41b9/"><img src="https://avatars.githubusercontent.com/u/72953646?v=4?s=100" width="100px;" alt="Arvin Fernandez"/><br /><sub><b>Arvin Fernandez</b></sub></a><br /><a href="#content-arvinf07" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/aureliefomum"><img src="https://avatars.githubusercontent.com/u/24625551?v=4?s=100" width="100px;" alt="Aurelie Fomum"/><br /><sub><b>Aurelie Fomum</b></sub></a><br /><a href="#content-aureliefomum" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://ruby.social/@aurelie_verrot"><img src="https://avatars.githubusercontent.com/u/50857179?v=4?s=100" width="100px;" alt="Aurelie Verrot"/><br /><sub><b>Aurelie Verrot</b></sub></a><br /><a href="#content-aurelieverrot" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/aurelie-verrot"><img src="https://avatars.githubusercontent.com/u/68602157?v=4?s=100" width="100px;" alt="Aurelie Verrot"/><br /><sub><b>Aurelie Verrot</b></sub></a><br /><a href="#content-aurelie-verrot" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/avinashupadhya99"><img src="https://avatars.githubusercontent.com/u/52544819?v=4?s=100" width="100px;" alt="Avinash Upadhyaya K R"/><br /><sub><b>Avinash Upadhyaya K R</b></sub></a><br /><a href="#content-avinashupadhya99" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://adiati.com/"><img src="https://avatars.githubusercontent.com/u/45172775?v=4?s=100" width="100px;" alt="Ayu Adiati"/><br /><sub><b>Ayu Adiati</b></sub></a><br /><a href="#content-adiati98" title="Content">🖋</a> <a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3Aadiati98" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/ayush-chaudhary-b3841216a/"><img src="https://avatars.githubusercontent.com/u/47343850?v=4?s=100" width="100px;" alt="Ayush Chaudhary"/><br /><sub><b>Ayush Chaudhary</b></sub></a><br /><a href="#content-Ayushchaudhary-Github" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.barbaralaw.me/"><img src="https://avatars.githubusercontent.com/u/64677474?v=4?s=100" width="100px;" alt="Barbara"/><br /><sub><b>Barbara</b></sub></a><br /><a href="#content-barbaralaw" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://bekahhw.github.io/"><img src="https://avatars.githubusercontent.com/u/34313413?v=4?s=100" width="100px;" alt="BekahHW"/><br /><sub><b>BekahHW</b></sub></a><br /><a href="#content-BekahHW" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bogdaaamn"><img src="https://avatars.githubusercontent.com/u/22895284?v=4?s=100" width="100px;" alt="Bogdan Covrig"/><br /><sub><b>Bogdan Covrig</b></sub></a><br /><a href="#content-bogdaaamn" title="Content">🖋</a> <a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3Abogdaaamn" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://brandonmichaelbrown.com/"><img src="https://avatars.githubusercontent.com/u/42486126?v=4?s=100" width="100px;" alt="Brandon Brown"/><br /><sub><b>Brandon Brown</b></sub></a><br /><a href="#content-brandonbrown4792" title="Content">🖋</a> <a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3Abrandonbrown4792" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://brandoneverett.dev/"><img src="https://avatars.githubusercontent.com/u/3941006?v=4?s=100" width="100px;" alt="Brandon Everett"/><br /><sub><b>Brandon Everett</b></sub></a><br /><a href="#content-bmeverett" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/brennakh"><img src="https://avatars.githubusercontent.com/u/97238153?v=4?s=100" width="100px;" alt="Brenna Hettler"/><br /><sub><b>Brenna Hettler</b></sub></a><br /><a href="#content-brennakh" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://brianmeeker.me/"><img src="https://avatars.githubusercontent.com/u/346992?v=4?s=100" width="100px;" alt="Brian Meeker"/><br /><sub><b>Brian Meeker</b></sub></a><br /><a href="#content-CuriousCurmudgeon" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.bryanhealey.com/"><img src="https://avatars.githubusercontent.com/u/1125475?v=4?s=100" width="100px;" alt="Bryan Healey"/><br /><sub><b>Bryan Healey</b></sub></a><br /><a href="#content-healeyb" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.ekronds.co.za/"><img src="https://avatars.githubusercontent.com/u/58180370?v=4?s=100" width="100px;" alt="C0deR4t"/><br /><sub><b>C0deR4t</b></sub></a><br /><a href="#content-c0der4t" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://caitlinfloyd.com/"><img src="https://avatars.githubusercontent.com/u/58532369?v=4?s=100" width="100px;" alt="Caitlin Floyd"/><br /><sub><b>Caitlin Floyd</b></sub></a><br /><a href="#content-cafloyd" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/carmenkolohe"><img src="https://avatars.githubusercontent.com/u/69023218?v=4?s=100" width="100px;" alt="Carmen"/><br /><sub><b>Carmen</b></sub></a><br /><a href="#content-carmenkolohe" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/CassidyMountjoy"><img src="https://avatars.githubusercontent.com/u/43921118?v=4?s=100" width="100px;" alt="Cassidy Mountjoy"/><br /><sub><b>Cassidy Mountjoy</b></sub></a><br /><a href="#content-CassidyMountjoy" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/chadrstewart"><img src="https://avatars.githubusercontent.com/u/11777161?v=4?s=100" width="100px;" alt="Chad Rhonan Stewart"/><br /><sub><b>Chad Rhonan Stewart</b></sub></a><br /><a href="#content-chadstewart" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/chelseaerinavery"><img src="https://avatars.githubusercontent.com/u/89863138?v=4?s=100" width="100px;" alt="Chelsea Avery"/><br /><sub><b>Chelsea Avery</b></sub></a><br /><a href="#content-chelseaerinavery" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://christopherleejarvis.com/"><img src="https://avatars.githubusercontent.com/u/10702993?v=4?s=100" width="100px;" alt="Chris Jarvis"/><br /><sub><b>Chris Jarvis</b></sub></a><br /><a href="#content-ClJarvis" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/christina-loiacono/"><img src="https://avatars.githubusercontent.com/u/65386414?v=4?s=100" width="100px;" alt="Christina Loiacono"/><br /><sub><b>Christina Loiacono</b></sub></a><br /><a href="#content-christina-ml" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://linkfree.eddiehub.io/CBID2"><img src="https://avatars.githubusercontent.com/u/105683440?v=4?s=100" width="100px;" alt="Christine Belzie"/><br /><sub><b>Christine Belzie</b></sub></a><br /><a href="https://github.com/Virtual-Coffee/virtualcoffee.io/commits?author=CBID2" title="Code">💻</a> <a href="#tool-CBID2" title="Tools">🔧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.christopherjin.com/"><img src="https://avatars.githubusercontent.com/u/52391491?v=4?s=100" width="100px;" alt="Christopher Jin"/><br /><sub><b>Christopher Jin</b></sub></a><br /><a href="#content-IntelliJinceTech" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://chrisjohnston.dev/"><img src="https://avatars.githubusercontent.com/u/46717850?v=4?s=100" width="100px;" alt="Christopher Johnston"/><br /><sub><b>Christopher Johnston</b></sub></a><br /><a href="#content-chrismjohnston" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/eclectic-coding"><img src="https://avatars.githubusercontent.com/u/13651291?v=4?s=100" width="100px;" alt="Chuck "/><br /><sub><b>Chuck </b></sub></a><br /><a href="#content-eclectic-coding" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/leenyburger"><img src="https://avatars.githubusercontent.com/u/9285725?v=4?s=100" width="100px;" alt="Colleen "/><br /><sub><b>Colleen </b></sub></a><br /><a href="#content-leenyburger" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/clandau"><img src="https://avatars.githubusercontent.com/u/12350042?v=4?s=100" width="100px;" alt="Courtney Landau"/><br /><sub><b>Courtney Landau</b></sub></a><br /><a href="#content-clandau" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/shaylalewis"><img src="https://avatars.githubusercontent.com/u/62856686?v=4?s=100" width="100px;" alt="Crime"/><br /><sub><b>Crime</b></sub></a><br /><a href="#content-shaylalewis" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/crislanarafael"><img src="https://avatars.githubusercontent.com/u/4523342?v=4?s=100" width="100px;" alt="Crislana Rafael"/><br /><sub><b>Crislana Rafael</b></sub></a><br /><a href="#content-crislanarafael" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/crisbnp"><img src="https://avatars.githubusercontent.com/u/42753366?v=4?s=100" width="100px;" alt="Cristien Natal"/><br /><sub><b>Cristien Natal</b></sub></a><br /><a href="#content-crisbnp" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/damonholden"><img src="https://avatars.githubusercontent.com/u/32943239?v=4?s=100" width="100px;" alt="Damon Holden"/><br /><sub><b>Damon Holden</b></sub></a><br /><a href="#content-damonholden" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://danott.dev/"><img src="https://avatars.githubusercontent.com/u/360261?v=4?s=100" width="100px;" alt="Dan Ott"/><br /><sub><b>Dan Ott</b></sub></a><br /><a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3Adanieltott" title="Bug reports">🐛</a> <a href="#a11y-danieltott" title="Accessibility">️️️️♿️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.danaottaviani.com/"><img src="https://avatars.githubusercontent.com/u/20132264?v=4?s=100" width="100px;" alt="Dana Ottaviani"/><br /><sub><b>Dana Ottaviani</b></sub></a><br /><a href="#content-Dana94" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/DanielRendox"><img src="https://avatars.githubusercontent.com/u/107246216?v=4?s=100" width="100px;" alt="Daniel"/><br /><sub><b>Daniel</b></sub></a><br /><a href="#content-DanielRendox" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://danieljanderson.github.io/"><img src="https://avatars.githubusercontent.com/u/30938196?v=4?s=100" width="100px;" alt="Daniel Anderson"/><br /><sub><b>Daniel Anderson</b></sub></a><br /><a href="#content-danieljanderson" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/danielcobo"><img src="https://avatars.githubusercontent.com/u/7779810?v=4?s=100" width="100px;" alt="Daniel Cobo"/><br /><sub><b>Daniel Cobo</b></sub></a><br /><a href="#content-danielcobo" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dapoadedire"><img src="https://avatars.githubusercontent.com/u/95668340?v=4?s=100" width="100px;" alt="Dapo Adedire"/><br /><sub><b>Dapo Adedire</b></sub></a><br /><a href="#content-dapoadedire" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/davidgsalgado"><img src="https://avatars.githubusercontent.com/u/119881104?v=4?s=100" width="100px;" alt="David "/><br /><sub><b>David </b></sub></a><br /><a href="#content-davidgsalgado" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://david-001.github.io/website/"><img src="https://avatars.githubusercontent.com/u/9206557?v=4?s=100" width="100px;" alt="David Akim"/><br /><sub><b>David Akim</b></sub></a><br /><a href="#content-david-001" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://blog.spinthemoose.com/"><img src="https://avatars.githubusercontent.com/u/43332?v=4?s=100" width="100px;" alt="David Alpert"/><br /><sub><b>David Alpert</b></sub></a><br /><a href="#content-davidalpert" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/DavidRod1865"><img src="https://avatars.githubusercontent.com/u/93050365?v=4?s=100" width="100px;" alt="David Rodriguez"/><br /><sub><b>David Rodriguez</b></sub></a><br /><a href="#content-DavidRod1865" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://bit.ly/debrakaye"><img src="https://avatars.githubusercontent.com/u/78452433?v=4?s=100" width="100px;" alt="Debra-Kaye Elliott"/><br /><sub><b>Debra-Kaye Elliott</b></sub></a><br /><a href="#content-debrakayeelliott" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://dominicduffin.uk/"><img src="https://avatars.githubusercontent.com/u/26224873?v=4?s=100" width="100px;" alt="Dominic Duffin"/><br /><sub><b>Dominic Duffin</b></sub></a><br /><a href="#content-dominicduffin1" title="Content">🖋</a> <a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3Adominicduffin1" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/EbonyLouis"><img src="https://avatars.githubusercontent.com/u/55366651?v=4?s=100" width="100px;" alt="Ebony Louis"/><br /><sub><b>Ebony Louis</b></sub></a><br /><a href="#content-EbonyLouis" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ehilst515"><img src="https://avatars.githubusercontent.com/u/65370630?v=4?s=100" width="100px;" alt="Enrique Hilst"/><br /><sub><b>Enrique Hilst</b></sub></a><br /><a href="#content-ehilst515" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/EvaGraceSmith"><img src="https://avatars.githubusercontent.com/u/115164153?v=4?s=100" width="100px;" alt="Eva Grace Smith"/><br /><sub><b>Eva Grace Smith</b></sub></a><br /><a href="#content-EvaGraceSmith" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fatima-ola"><img src="https://avatars.githubusercontent.com/u/57072944?v=4?s=100" width="100px;" alt="Fatima Olasunkanmi-Ojo"/><br /><sub><b>Fatima Olasunkanmi-Ojo</b></sub></a><br /><a href="#content-fatima-ola" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://gantlaborde.com/"><img src="https://avatars.githubusercontent.com/u/997157?v=4?s=100" width="100px;" alt="Gant Laborde"/><br /><sub><b>Gant Laborde</b></sub></a><br /><a href="#content-GantMan" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/gervanna"><img src="https://avatars.githubusercontent.com/u/55126599?v=4?s=100" width="100px;" alt="Gervanna Stephens"/><br /><sub><b>Gervanna Stephens</b></sub></a><br /><a href="#content-gervanna" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://glenmccallum.com/"><img src="https://avatars.githubusercontent.com/u/25654800?v=4?s=100" width="100px;" alt="Glen McCallum"/><br /><sub><b>Glen McCallum</b></sub></a><br /><a href="#content-glenmccallumcan" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/HDreikorn"><img src="https://avatars.githubusercontent.com/u/32907903?v=4?s=100" width="100px;" alt="HDreikorn"/><br /><sub><b>HDreikorn</b></sub></a><br /><a href="#content-HDreikorn" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://medium.com/@bl34chchig0"><img src="https://avatars.githubusercontent.com/u/133022207?v=4?s=100" width="100px;" alt="Habeeb Kareem"/><br /><sub><b>Habeeb Kareem</b></sub></a><br /><a href="#content-bL34cHig0" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://imani-dev-portfolio.vercel.app/"><img src="https://avatars.githubusercontent.com/u/111655655?v=4?s=100" width="100px;" alt="Imani Roberts"/><br /><sub><b>Imani Roberts</b></sub></a><br /><a href="#content-imanidev" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Jamaalwbrown"><img src="https://avatars.githubusercontent.com/u/59902352?v=4?s=100" width="100px;" alt="Jamaal Brown"/><br /><sub><b>Jamaal Brown</b></sub></a><br /><a href="#content-Jamaalwbrown" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jamescurran"><img src="https://avatars.githubusercontent.com/u/191814?v=4?s=100" width="100px;" alt="James Curran"/><br /><sub><b>James Curran</b></sub></a><br /><a href="#content-jamescurran" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://jasmine582.github.io/jas_develops"><img src="https://avatars.githubusercontent.com/u/70559611?v=4?s=100" width="100px;" alt="Jasmine "/><br /><sub><b>Jasmine </b></sub></a><br /><a href="#content-Jasmine582" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.jasonevans.dev/"><img src="https://avatars.githubusercontent.com/u/53913153?v=4?s=100" width="100px;" alt="Jason Evans"/><br /><sub><b>Jason Evans</b></sub></a><br /><a href="#content-GrumpyMonk26" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/JayRKyd"><img src="https://avatars.githubusercontent.com/u/63754188?v=4?s=100" width="100px;" alt="Jay Knowles"/><br /><sub><b>Jay Knowles</b></sub></a><br /><a href="#content-JayRKyd" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.jenkens.dev/"><img src="https://avatars.githubusercontent.com/u/25398021?v=4?s=100" width="100px;" alt="Jen Kennedy"/><br /><sub><b>Jen Kennedy</b></sub></a><br /><a href="#content-jenkens-dev" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jenieg"><img src="https://avatars.githubusercontent.com/u/126206644?v=4?s=100" width="100px;" alt="Jennifer"/><br /><sub><b>Jennifer</b></sub></a><br /><a href="#content-jenieg" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/JesseRWeigel"><img src="https://avatars.githubusercontent.com/u/11077930?v=4?s=100" width="100px;" alt="Jesse R Weigel"/><br /><sub><b>Jesse R Weigel</b></sub></a><br /><a href="#content-JesseRWeigel" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://jessicawilkins.dev/"><img src="https://avatars.githubusercontent.com/u/67210629?v=4?s=100" width="100px;" alt="Jessica Wilkins "/><br /><sub><b>Jessica Wilkins </b></sub></a><br /><a href="#content-jdwilkin4" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://joekarow.dev/"><img src="https://avatars.githubusercontent.com/u/58997957?v=4?s=100" width="100px;" alt="Joe Karow"/><br /><sub><b>Joe Karow</b></sub></a><br /><a href="#content-JoeKarow" title="Content">🖋</a> <a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3AJoeKarow" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://narigo.dev/"><img src="https://avatars.githubusercontent.com/u/1767865?v=4?s=100" width="100px;" alt="Joern Bernhardt"/><br /><sub><b>Joern Bernhardt</b></sub></a><br /><a href="#content-Narigo" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://polywork.com/j_escamilla"><img src="https://avatars.githubusercontent.com/u/85367358?v=4?s=100" width="100px;" alt="John Escamilla"/><br /><sub><b>John Escamilla</b></sub></a><br /><a href="#content-J-Escamilla" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.jonathanyeong.com/"><img src="https://avatars.githubusercontent.com/u/3861088?v=4?s=100" width="100px;" alt="Jonathan Yeong"/><br /><sub><b>Jonathan Yeong</b></sub></a><br /><a href="#content-jonathanyeong" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jjshanks"><img src="https://avatars.githubusercontent.com/u/62661?v=4?s=100" width="100px;" alt="Joshua Shanks"/><br /><sub><b>Joshua Shanks</b></sub></a><br /><a href="#content-jjshanks" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/juliaseid"><img src="https://avatars.githubusercontent.com/u/50395446?v=4?s=100" width="100px;" alt="Julia Seidman"/><br /><sub><b>Julia Seidman</b></sub></a><br /><a href="#content-juliaseid" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ZenMnky"><img src="https://avatars.githubusercontent.com/u/59234683?v=4?s=100" width="100px;" alt="Justin Hager"/><br /><sub><b>Justin Hager</b></sub></a><br /><a href="#content-ZenMnky" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://justinnoel.dev/"><img src="https://avatars.githubusercontent.com/u/81643826?v=4?s=100" width="100px;" alt="Justin Noel"/><br /><sub><b>Justin Noel</b></sub></a><br /><a href="#content-justinnoel" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://justinquinn.dev/"><img src="https://avatars.githubusercontent.com/u/42960493?v=4?s=100" width="100px;" alt="Justin Quinn"/><br /><sub><b>Justin Quinn</b></sub></a><br /><a href="#content-Justin-Quinn51" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://linktr.ee/wheeleruniverse"><img src="https://avatars.githubusercontent.com/u/71364086?v=4?s=100" width="100px;" alt="Justin Wheeler"/><br /><sub><b>Justin Wheeler</b></sub></a><br /><a href="#content-wheeleruniverse" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://kai.grumpyduck.dev/"><img src="https://avatars.githubusercontent.com/u/34093187?v=4?s=100" width="100px;" alt="Kai Katschthaler (they/them)"/><br /><sub><b>Kai Katschthaler (they/them)</b></sub></a><br /><a href="#content-thegrumpyenby" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://medium.com/@kamalwalia"><img src="https://avatars.githubusercontent.com/u/29870181?v=4?s=100" width="100px;" alt="Kamal"/><br /><sub><b>Kamal</b></sub></a><br /><a href="#content-Kamal-Walia" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/kldickenson/"><img src="https://avatars.githubusercontent.com/u/2073648?v=4?s=100" width="100px;" alt="Karen Dickenson"/><br /><sub><b>Karen Dickenson</b></sub></a><br /><a href="#content-kldickenson" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tkshill"><img src="https://avatars.githubusercontent.com/u/13292886?v=4?s=100" width="100px;" alt="Kirk Shillingford"/><br /><sub><b>Kirk Shillingford</b></sub></a><br /><a href="#content-tkshill" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/klezi10"><img src="https://avatars.githubusercontent.com/u/74952593?v=4?s=100" width="100px;" alt="Klesta"/><br /><sub><b>Klesta</b></sub></a><br /><a href="#content-klezi10" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://kbazoukis.com/"><img src="https://avatars.githubusercontent.com/u/25367884?v=4?s=100" width="100px;" alt="Konstantinos Bazoukis"/><br /><sub><b>Konstantinos Bazoukis</b></sub></a><br /><a href="#content-NtinosNG" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/LauraLangdon"><img src="https://avatars.githubusercontent.com/u/48335772?v=4?s=100" width="100px;" alt="Laura Langdon"/><br /><sub><b>Laura Langdon</b></sub></a><br /><a href="#content-LauraLangdon" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Lor1138"><img src="https://avatars.githubusercontent.com/u/54803384?v=4?s=100" width="100px;" alt="Laura OBrien"/><br /><sub><b>Laura OBrien</b></sub></a><br /><a href="#content-Lor1138" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ridonky"><img src="https://avatars.githubusercontent.com/u/75059734?v=4?s=100" width="100px;" alt="Lauren Perini"/><br /><sub><b>Lauren Perini</b></sub></a><br /><a href="#content-ridonky" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/lennox-codes"><img src="https://avatars.githubusercontent.com/u/76533266?v=4?s=100" width="100px;" alt="Lennox Gilbert"/><br /><sub><b>Lennox Gilbert</b></sub></a><br /><a href="#content-lennox-codes" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Leoactionz"><img src="https://avatars.githubusercontent.com/u/47278525?v=4?s=100" width="100px;" alt="Leo"/><br /><sub><b>Leo</b></sub></a><br /><a href="#content-Leoactionz" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://lsparlin.dev/"><img src="https://avatars.githubusercontent.com/u/1904364?v=4?s=100" width="100px;" alt="Lewis Sparlin"/><br /><sub><b>Lewis Sparlin</b></sub></a><br /><a href="#content-lsparlin" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/loganom"><img src="https://avatars.githubusercontent.com/u/2434012?v=4?s=100" width="100px;" alt="Logan McCamon"/><br /><sub><b>Logan McCamon</b></sub></a><br /><a href="#content-loganom" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/lohityarra"><img src="https://avatars.githubusercontent.com/u/43040093?v=4?s=100" width="100px;" alt="Lohit Yarra"/><br /><sub><b>Lohit Yarra</b></sub></a><br /><a href="#content-lohityarra" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Arol15"><img src="https://avatars.githubusercontent.com/u/25575320?v=4?s=100" width="100px;" alt="Lora Rusinouskaya"/><br /><sub><b>Lora Rusinouskaya</b></sub></a><br /><a href="#content-Arol15" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://luciacerchie.dev/blog"><img src="https://avatars.githubusercontent.com/u/54046179?v=4?s=100" width="100px;" alt="Lucia Cerchie"/><br /><sub><b>Lucia Cerchie</b></sub></a><br /><a href="#content-Cerchie" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/lasj"><img src="https://avatars.githubusercontent.com/u/21262760?v=4?s=100" width="100px;" alt="Luis Sanchez"/><br /><sub><b>Luis Sanchez</b></sub></a><br /><a href="#content-LSanchez17" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bjorkypie"><img src="https://avatars.githubusercontent.com/u/43662395?v=4?s=100" width="100px;" alt="Madeline H"/><br /><sub><b>Madeline H</b></sub></a><br /><a href="#content-bjorkypie" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/manya706"><img src="https://avatars.githubusercontent.com/u/96016153?v=4?s=100" width="100px;" alt="Manya Sharma"/><br /><sub><b>Manya Sharma</b></sub></a><br /><a href="https://github.com/Virtual-Coffee/virtualcoffee.io/commits?author=manya706" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/MarieReRe"><img src="https://avatars.githubusercontent.com/u/52573981?v=4?s=100" width="100px;" alt="Marie"/><br /><sub><b>Marie</b></sub></a><br /><a href="#content-MarieReRe" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://mary-lueder-portfolio.netlify.app/"><img src="https://avatars.githubusercontent.com/u/118684310?v=4?s=100" width="100px;" alt="Mary Lueder"/><br /><sub><b>Mary Lueder</b></sub></a><br /><a href="#content-mjlueder" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/MattyMc"><img src="https://avatars.githubusercontent.com/u/1302166?v=4?s=100" width="100px;" alt="Matt McInnis (he/him)"/><br /><sub><b>Matt McInnis (he/him)</b></sub></a><br /><a href="#content-MattyMc" title="Content">🖋</a> <a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3AMattyMc" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mattxwang"><img src="https://avatars.githubusercontent.com/u/14893287?v=4?s=100" width="100px;" alt="Matt Wang"/><br /><sub><b>Matt Wang</b></sub></a><br /><a href="#content-mattxwang" title="Content">🖋</a> <a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3Amattxwang" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mccurcio"><img src="https://avatars.githubusercontent.com/u/1915749?v=4?s=100" width="100px;" alt="MattCurcio"/><br /><sub><b>MattCurcio</b></sub></a><br /><a href="#content-mccurcio" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://twitter.com/MatthewTFoley"><img src="https://avatars.githubusercontent.com/u/3792749?v=4?s=100" width="100px;" alt="Matthew"/><br /><sub><b>Matthew</b></sub></a><br /><a href="#content-mtfoley" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/matthew-dean"><img src="https://avatars.githubusercontent.com/u/414752?v=4?s=100" width="100px;" alt="Matthew Dean"/><br /><sub><b>Matthew Dean</b></sub></a><br /><a href="#content-matthew-dean" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/maylene-poulsen/"><img src="https://avatars.githubusercontent.com/u/58043669?v=4?s=100" width="100px;" alt="Maylene Poulsen"/><br /><sub><b>Maylene Poulsen</b></sub></a><br /><a href="#content-maylenepoulsen" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://meghangutshall.com/"><img src="https://avatars.githubusercontent.com/u/37842352?v=4?s=100" width="100px;" alt="Meg Gutshall"/><br /><sub><b>Meg Gutshall</b></sub></a><br /><a href="#content-meg-gutshall" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://https//gwn-ws.com"><img src="https://avatars.githubusercontent.com/u/1579750?v=4?s=100" width="100px;" alt="Michael Honey-Arcement"/><br /><sub><b>Michael Honey-Arcement</b></sub></a><br /><a href="#content-chaos986" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://baldbeardedbuilder.com/"><img src="https://avatars.githubusercontent.com/u/1228996?v=4?s=100" width="100px;" alt="Michael Jolley"/><br /><sub><b>Michael Jolley</b></sub></a><br /><a href="#content-michaeljolley" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://mikerogers.io/"><img src="https://avatars.githubusercontent.com/u/325384?v=4?s=100" width="100px;" alt="Mike Rogers"/><br /><sub><b>Mike Rogers</b></sub></a><br /><a href="#content-MikeRogers0" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.mikestreety.co.uk/"><img src="https://avatars.githubusercontent.com/u/354085?v=4?s=100" width="100px;" alt="Mike Street"/><br /><sub><b>Mike Street</b></sub></a><br /><a href="#content-mikestreety" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Mohsin-mw"><img src="https://avatars.githubusercontent.com/u/122507740?v=4?s=100" width="100px;" alt="Mohsin"/><br /><sub><b>Mohsin</b></sub></a><br /><a href="#content-Mohsin-mw" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/manthony9"><img src="https://avatars.githubusercontent.com/u/13238071?v=4?s=100" width="100px;" alt="Morris Anthony"/><br /><sub><b>Morris Anthony</b></sub></a><br /><a href="#content-manthony9" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Zooglon"><img src="https://avatars.githubusercontent.com/u/76045918?v=4?s=100" width="100px;" alt="Nath Duncan"/><br /><sub><b>Nath Duncan</b></sub></a><br /><a href="#content-Zooglon" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/neilitalia"><img src="https://avatars.githubusercontent.com/u/38524171?v=4?s=100" width="100px;" alt="Neil Italia"/><br /><sub><b>Neil Italia</b></sub></a><br /><a href="#content-neilitalia" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.developindvlpr.com/"><img src="https://avatars.githubusercontent.com/u/18251846?v=4?s=100" width="100px;" alt="Nerando Johnson"/><br /><sub><b>Nerando Johnson</b></sub></a><br /><a href="#content-Nerajno" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://nickyt.co/"><img src="https://avatars.githubusercontent.com/u/833231?v=4?s=100" width="100px;" alt="Nick Taylor"/><br /><sub><b>Nick Taylor</b></sub></a><br /><a href="#content-nickytonline" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nicoolel"><img src="https://avatars.githubusercontent.com/u/56747239?v=4?s=100" width="100px;" alt="Nicole Lee"/><br /><sub><b>Nicole Lee</b></sub></a><br /><a href="#content-nicoolel" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://snikhill.tech/"><img src="https://avatars.githubusercontent.com/u/51415616?v=4?s=100" width="100px;" alt="Nikkhiel Seath"/><br /><sub><b>Nikkhiel Seath</b></sub></a><br /><a href="#content-SNikhill" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://niklas.fyi/"><img src="https://avatars.githubusercontent.com/u/9086371?v=4?s=100" width="100px;" alt="Niklas Siefke"/><br /><sub><b>Niklas Siefke</b></sub></a><br /><a href="#content-niklasfyi" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.nikohoffren.com/"><img src="https://avatars.githubusercontent.com/u/82566656?v=4?s=100" width="100px;" alt="Niko Hoffrén"/><br /><sub><b>Niko Hoffrén</b></sub></a><br /><a href="#content-nikohoffren" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://norafergany.com/"><img src="https://avatars.githubusercontent.com/u/25270812?v=4?s=100" width="100px;" alt="Nora Fergany"/><br /><sub><b>Nora Fergany</b></sub></a><br /><a href="#content-norafergany" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://iamteri.tech/"><img src="https://avatars.githubusercontent.com/u/25850598?v=4?s=100" width="100px;" alt="Oteri Eyenike"/><br /><sub><b>Oteri Eyenike</b></sub></a><br /><a href="#content-Terieyenike" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/paceaux"><img src="https://avatars.githubusercontent.com/u/518862?v=4?s=100" width="100px;" alt="Paceaux"/><br /><sub><b>Paceaux</b></sub></a><br /><a href="#content-paceaux" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/patricio-huerta/"><img src="https://avatars.githubusercontent.com/u/59483053?v=4?s=100" width="100px;" alt="Patricio Huerta"/><br /><sub><b>Patricio Huerta</b></sub></a><br /><a href="#content-HpatricioH" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/piotrszymaniec"><img src="https://avatars.githubusercontent.com/u/5377285?v=4?s=100" width="100px;" alt="Piotrek"/><br /><sub><b>Piotrek</b></sub></a><br /><a href="#content-piotrszymaniec" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/radturkin"><img src="https://avatars.githubusercontent.com/u/67508317?v=4?s=100" width="100px;" alt="Rad Turkin"/><br /><sub><b>Rad Turkin</b></sub></a><br /><a href="#content-radturkin" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://raeshellerose.netlify.app/"><img src="https://avatars.githubusercontent.com/u/93204000?v=4?s=100" width="100px;" alt="Raeshelle Rose"/><br /><sub><b>Raeshelle Rose</b></sub></a><br /><a href="#content-raeplusplus" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.rahat.dev/"><img src="https://avatars.githubusercontent.com/u/40510125?v=4?s=100" width="100px;" alt="Rahat Chowdhury"/><br /><sub><b>Rahat Chowdhury</b></sub></a><br /><a href="#content-Rahat-ch" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://ramonh.dev/"><img src="https://avatars.githubusercontent.com/u/656318?v=4?s=100" width="100px;" alt="Ramón Huidobro"/><br /><sub><b>Ramón Huidobro</b></sub></a><br /><a href="#content-hola-soy-milk" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://statechange.ai/"><img src="https://avatars.githubusercontent.com/u/12201983?v=4?s=100" width="100px;" alt="Ray Deck"/><br /><sub><b>Ray Deck</b></sub></a><br /><a href="#content-rhdeck" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://raynaldmirville.com/"><img src="https://avatars.githubusercontent.com/u/1623207?v=4?s=100" width="100px;" alt="Raynald Mirville"/><br /><sub><b>Raynald Mirville</b></sub></a><br /><a href="#content-rmirville" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/raaynaldo"><img src="https://avatars.githubusercontent.com/u/22878284?v=4?s=100" width="100px;" alt="Raynaldo Sutisna"/><br /><sub><b>Raynaldo Sutisna</b></sub></a><br /><a href="#content-raaynaldo" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://rebeccakeyphd.com/"><img src="https://avatars.githubusercontent.com/u/47927958?v=4?s=100" width="100px;" alt="Rebecca Key"/><br /><sub><b>Rebecca Key</b></sub></a><br /><a href="#content-rek990" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/redapy"><img src="https://avatars.githubusercontent.com/u/85396770?v=4?s=100" width="100px;" alt="Reda Baha"/><br /><sub><b>Reda Baha</b></sub></a><br /><a href="#content-redapy" title="Content">🖋</a> <a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues?q=author%3Aredapy" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://regina-robinson.netlify.app/"><img src="https://avatars.githubusercontent.com/u/78179566?v=4?s=100" width="100px;" alt="Regina Robinson"/><br /><sub><b>Regina Robinson</b></sub></a><br /><a href="#content-regromrob" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://rishabh1s.web.app/"><img src="https://avatars.githubusercontent.com/u/89694788?v=4?s=100" width="100px;" alt="Rishabh Singh"/><br /><sub><b>Rishabh Singh</b></sub></a><br /><a href="#content-rishabh1S" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jamesrascal"><img src="https://avatars.githubusercontent.com/u/6054150?v=4?s=100" width="100px;" alt="Roger Gentry"/><br /><sub><b>Roger Gentry</b></sub></a><br /><a href="#content-jamesrascal" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://rutareiso.netlify.app/"><img src="https://avatars.githubusercontent.com/u/73975409?v=4?s=100" width="100px;" alt="Ruta R"/><br /><sub><b>Ruta R</b></sub></a><br /><a href="#content-RReiso" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/shiftyp"><img src="https://avatars.githubusercontent.com/u/131928?v=4?s=100" width="100px;" alt="Ryan Kahn"/><br /><sub><b>Ryan Kahn</b></sub></a><br /><a href="#content-shiftyp" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sadiejay"><img src="https://avatars.githubusercontent.com/u/19538219?v=4?s=100" width="100px;" alt="Sadie"/><br /><sub><b>Sadie</b></sub></a><br /><a href="#content-sadiejay" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.brokenpier.com/"><img src="https://avatars.githubusercontent.com/u/97759871?v=4?s=100" width="100px;" alt="Safety Vest 2789"/><br /><sub><b>Safety Vest 2789</b></sub></a><br /><a href="#content-SafetyVest2789" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://satoshis-developer.xyz/portfolio/"><img src="https://avatars.githubusercontent.com/u/73622805?v=4?s=100" width="100px;" alt="Satoshi S."/><br /><sub><b>Satoshi S.</b></sub></a><br /><a href="#content-Satoshi-Sh" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://sethhall.dev/"><img src="https://avatars.githubusercontent.com/u/1033332?v=4?s=100" width="100px;" alt="Seth Hall"/><br /><sub><b>Seth Hall</b></sub></a><br /><a href="#content-sethburtonhall" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/funbunch"><img src="https://avatars.githubusercontent.com/u/3441200?v=4?s=100" width="100px;" alt="Shannan Bunch"/><br /><sub><b>Shannan Bunch</b></sub></a><br /><a href="#content-funbunch" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://magsol.github.io/"><img src="https://avatars.githubusercontent.com/u/135417?v=4?s=100" width="100px;" alt="Shannon"/><br /><sub><b>Shannon</b></sub></a><br /><a href="#content-magsol" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.shelleymcq.dev/"><img src="https://avatars.githubusercontent.com/u/81432121?v=4?s=100" width="100px;" alt="Shelley McHardy"/><br /><sub><b>Shelley McHardy</b></sub></a><br /><a href="#content-shelleymcq" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.shraddha.tech/"><img src="https://avatars.githubusercontent.com/u/27571141?v=4?s=100" width="100px;" alt="Shraddha"/><br /><sub><b>Shraddha</b></sub></a><br /><a href="#content-5hraddha" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://simonprickett.dev/"><img src="https://avatars.githubusercontent.com/u/94062?v=4?s=100" width="100px;" alt="Simon Prickett"/><br /><sub><b>Simon Prickett</b></sub></a><br /><a href="#content-simonprickett" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sirohub"><img src="https://avatars.githubusercontent.com/u/54137956?v=4?s=100" width="100px;" alt="Simon Robinson"/><br /><sub><b>Simon Robinson</b></sub></a><br /><a href="#content-sirohub" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/superspike7"><img src="https://avatars.githubusercontent.com/u/65844337?v=4?s=100" width="100px;" alt="Spike Vinz Cruz"/><br /><sub><b>Spike Vinz Cruz</b></sub></a><br /><a href="#content-superspike7" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/s-blais"><img src="https://avatars.githubusercontent.com/u/51341914?v=4?s=100" width="100px;" alt="Stephen Blais"/><br /><sub><b>Stephen Blais</b></sub></a><br /><a href="#content-s-blais" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/carrollsa"><img src="https://avatars.githubusercontent.com/u/76665107?v=4?s=100" width="100px;" alt="Steve Carroll"/><br /><sub><b>Steve Carroll</b></sub></a><br /><a href="#content-carrollsa" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/SUCHITRAGIRI"><img src="https://avatars.githubusercontent.com/u/60110218?v=4?s=100" width="100px;" alt="Suchitra Giri"/><br /><sub><b>Suchitra Giri</b></sub></a><br /><a href="#content-SUCHITRAGIRI" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://dev.to/sumitkharche"><img src="https://avatars.githubusercontent.com/u/43902034?v=4?s=100" width="100px;" alt="Sumit Kharche"/><br /><sub><b>Sumit Kharche</b></sub></a><br /><a href="#content-sumitkharche" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/SuperRoach"><img src="https://avatars.githubusercontent.com/u/63333?v=4?s=100" width="100px;" alt="SuperRoach"/><br /><sub><b>SuperRoach</b></sub></a><br /><a href="#content-SuperRoach" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/surajrpanchal"><img src="https://avatars.githubusercontent.com/u/25049536?v=4?s=100" width="100px;" alt="Suraj Panchal"/><br /><sub><b>Suraj Panchal</b></sub></a><br /><a href="#content-surajrpanchal" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://suze.dev/"><img src="https://avatars.githubusercontent.com/u/6759411?v=4?s=100" width="100px;" alt="Suze Shardlow"/><br /><sub><b>Suze Shardlow</b></sub></a><br /><a href="#content-SuzeShardlow" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Tamsauce"><img src="https://avatars.githubusercontent.com/u/74758886?v=4?s=100" width="100px;" alt="Tami Hughes"/><br /><sub><b>Tami Hughes</b></sub></a><br /><a href="#content-Tamsauce" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tgmiller5"><img src="https://avatars.githubusercontent.com/u/2456949?v=4?s=100" width="100px;" alt="Tammy Miller"/><br /><sub><b>Tammy Miller</b></sub></a><br /><a href="#content-tgmiller5" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/TarynMcMillan"><img src="https://avatars.githubusercontent.com/u/74480978?v=4?s=100" width="100px;" alt="Taryn McMillan"/><br /><sub><b>Taryn McMillan</b></sub></a><br /><a href="#content-TarynMcMillan" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/CodingatTiffanys"><img src="https://avatars.githubusercontent.com/u/37156207?v=4?s=100" width="100px;" alt="Tiffany Pena"/><br /><sub><b>Tiffany Pena</b></sub></a><br /><a href="#content-CodingatTiffanys" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/tiffanyudoh/"><img src="https://avatars.githubusercontent.com/u/55888277?v=4?s=100" width="100px;" alt="Tiffany U"/><br /><sub><b>Tiffany U</b></sub></a><br /><a href="#content-cassiel257" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://toddl.dev/"><img src="https://avatars.githubusercontent.com/u/40549031?v=4?s=100" width="100px;" alt="Todd Libby"/><br /><sub><b>Todd Libby</b></sub></a><br /><a href="#content-colabottles" title="Content">🖋</a> <a href="#a11y-colabottles" title="Accessibility">️️️️♿️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/tom-bousquet/"><img src="https://avatars.githubusercontent.com/u/70987091?v=4?s=100" width="100px;" alt="Tom Bousquet"/><br /><sub><b>Tom Bousquet</b></sub></a><br /><a href="#content-tombousquet" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://tomcudd.com/"><img src="https://avatars.githubusercontent.com/u/30203207?v=4?s=100" width="100px;" alt="Tom Cudd"/><br /><sub><b>Tom Cudd</b></sub></a><br /><a href="#content-tomcudd" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://dev.to/torianne02"><img src="https://avatars.githubusercontent.com/u/37308853?v=4?s=100" width="100px;" alt="Tori Crawford"/><br /><sub><b>Tori Crawford</b></sub></a><br /><a href="#content-torianne02" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/LincolnFleet"><img src="https://avatars.githubusercontent.com/u/36611345?v=4?s=100" width="100px;" alt="Travis Martin"/><br /><sub><b>Travis Martin</b></sub></a><br /><a href="#content-LincolnFleet" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/danieluhl"><img src="https://avatars.githubusercontent.com/u/1517899?v=4?s=100" width="100px;" alt="Typing Turtle"/><br /><sub><b>Typing Turtle</b></sub></a><br /><a href="#content-danieluhl" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://vanessapoppe.me/"><img src="https://avatars.githubusercontent.com/u/46777560?v=4?s=100" width="100px;" alt="Vanessa "/><br /><sub><b>Vanessa </b></sub></a><br /><a href="#content-vanessacor" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://vicvijayakumar.com/"><img src="https://avatars.githubusercontent.com/u/205796?v=4?s=100" width="100px;" alt="Vic Vijayakumar"/><br /><sub><b>Vic Vijayakumar</b></sub></a><br /><a href="#content-needcaffeine" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://techhub.social/@VinceAggrippino"><img src="https://avatars.githubusercontent.com/u/195491?v=4?s=100" width="100px;" alt="Vince Aggrippino"/><br /><sub><b>Vince Aggrippino</b></sub></a><br /><a href="#content-VAggrippino" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sohodoll"><img src="https://avatars.githubusercontent.com/u/106656745?v=4?s=100" width="100px;" alt="Vitaly Kovalev"/><br /><sub><b>Vitaly Kovalev</b></sub></a><br /><a href="#content-sohodoll" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.yhaynes.com/"><img src="https://avatars.githubusercontent.com/u/12980710?v=4?s=100" width="100px;" alt="Yolanda Haynes"/><br /><sub><b>Yolanda Haynes</b></sub></a><br /><a href="#content-YolandaHaynes" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://yufa-li.com/"><img src="https://avatars.githubusercontent.com/u/112290188?v=4?s=100" width="100px;" alt="Yufa "/><br /><sub><b>Yufa </b></sub></a><br /><a href="#content-01001101CK" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://taiwodevlab.hashnode.dev/"><img src="https://avatars.githubusercontent.com/u/25867172?v=4?s=100" width="100px;" alt="Yusuf Taiwo Hassan"/><br /><sub><b>Yusuf Taiwo Hassan</b></sub></a><br /><a href="#content-teezzan" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/secondl1ght"><img src="https://avatars.githubusercontent.com/u/85003930?v=4?s=100" width="100px;" alt="secondl1ght"/><br /><sub><b>secondl1ght</b></sub></a><br /><a href="#content-secondl1ght" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.codewars.com/users/raykotab"><img src="https://avatars.githubusercontent.com/u/67748738?v=4?s=100" width="100px;" alt="Álvaro Sánchez Taboada"/><br /><sub><b>Álvaro Sánchez Taboada</b></sub></a><br /><a href="#content-raykotab" title="Content">🖋</a></td>
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
