---
layout: layouts/resources.njk
title: Guide to Open Source
description: A Virtual Coffee guide to all things Open Source!
hero: 'svg/undraw_To_do_list_re_9nt7.svg'
heroHeader: 'Guide to Open Source'
heroSubheader: 'A Virtual Coffee guide to all things Open Source!'
tags: memberresources
eleventyNavigation:
  key: GuideToOpenSource
  title: Guide to Open Source
  excerpt: A Virtual Coffee guide to all things Open Source!
  parent: OSS
  order: 3
---

{% textContainer %}

# What is this document for?

{% leadText %}

{% endleadText %}

{% endtextContainer %}

{% textContainer 'white' %}

<h2>Table of Contents</h2>

${toc}

## Guide to writing issues

- existing

## Repository Checklist

If you are a contributor, this checklist is a handy tool for evaluating how well set up to receive contributions a project is.

If you are a maintainer looking to open an open source project to contributions, this checklist will help you to get your repository into a good state to start receiving external contributions.

Here's the checklist. For more detailed explanation of these points, check out the [Maintainers Checklist](../oss-maintainer-checklist/) It isn't necessary for a project in the wild to have _all_ of these things, but it should have most of them.

- ✅ It should have a relevant name.
- ✅ It should have a clear description that tells you what the project does and what it's for.
- ✅ It should have relevant tags highlighting its scope/stack/field etc.
- ✅ Also, if participating in [Hacktoberfest](https://hacktoberfest.digitalocean.com/), the `hacktoberfest` topic should be placed in the project description, or the `hacktoberfest-accepted` label added to accepted pull requests
- ✅ It should have a README. The README should link to or describe:
  - Project purpose and context
  - Installation instructions
- ✅ Contributions/Contributing guide:
  - What is the recommended process for making issues/submitting pull requests
  - How to communicate with maintainers.
- ✅ A valid OSS license (Essential. Period. The project is not open source if it doesn't have a valid OSS license.)
- ✅ A Code of Conduct
- ✅ Issue and Pull request templates

## Best practices for maintainers

### Communicating with contributors

Communication is key to running a successful open source project. Establish conventions for communications early on and make sure these are clearly documented. Many projects communicate via issues and pull requests, while some use external platforms such as Slack channels, a forum, IRC channels or email lists. All are valid ways to communicate, the important thing is to figure out what is most appropriate for your project. If you are unsure what is best and have no reason not to, using issues and pull requests is a solid choice. If you are maintaining a company project that is open to external contributors, care should be taken to coordinate internal and external communication so that outside contributors don't miss out on important updates communicated internally.

Regardless of the tools used to communicate, there are certain things to keep in mind to keep communication effective and respectful, especially in a international online space.

- Your repository should have a Code of Conduct, and all communication should follow the Code of Conduct.
- Messages should be kept short and simple. It is often best to keep to 'one message, one topic', although there may be times when this not possible, for example if you need to respond to several points in another message, or you are going to be unavailable for a time and need to communicate several points at once. If you need to discuss several points in one message, put each point in a separate paragraph.
- Disagreement and debate are healthy, but it is important to keep the conversation respectful. Criticize the ideas people express, but don't criticize the person directly.
- Low context communication works best in international, cross-cultural spaces. Meanings should be explicit in the words you use, specific cultural references, cliches and sayings might not be understood by people from different cultures.

### Managing expectations

To ensure the smooth running of a project with external contributors, it is important to effectively manage expectations both of maintainers and contributors.

Maintainers can help ensure that their expectations of contributors are clear by:

- Breaking down tasks that are to be opened to external contributors into small, well-defined chunks.
- Ensuring that any preferences for code style, branch names, git workflows, etc are clearly communicated in the contributing guide or readme.

Maintainers can help ensure that they meet the expectations of contributors by:

- Clearly communicating what support the maintainers can provide, if any (e.g. pair programming, answering questions).
- Clearly communicating maintainer availability and expected timescales for reviewing pull requests.

### Building community

Having a strong community around an open source project can be crucial to the project's success. A effective community around an open source project will help the maintainers handle support, spread the word and bring new users and contributors to the project and gives an opportunity for maintainers to get feedback and new ideas to help the project fulfil the needs and aspirations of users.

Building a community takes effort, and this effort should be seen as equally important as the technical development effort. It is about both tools that enable community building and about making and nurturing connections with and between people, which no tool can do on its own.

Things that will help build a community include:

- A place for discussion to happen. For smaller projects where the community is focused on project questions and development discussions, this could just be Github issues. For larger projects or if you want to build a community in a broader sense, a separate venue such as a Slack or Discord community or forum will probably work better.
- A Code of Conduct to set boundaries for interaction and keep the community a welcoming space for everyone.
- Community documentation explaining how the community works and where to go for what. For example, here at Virtual Coffee we have our [Member Resources](https://virtualcoffee.io/resources/virtual-coffee/) page.
- Leading with empathy and kindness, and welcoming new people and helping them find their way in the community. Joining a new community where you don't know the people can be an intimidating experience, and you can go a long way to ease the journey.

### Avoiding burnout

Maintaining an open source project can be a lot of work, and many people do it on the side as well as their "day job". It is important not to be mindful of the risk of burnout and take steps to keep the work at a manageable level.

Good steps to take include:

- Figure out a reasonable time frame for responding to issues and pull requests, and include it in your documentation. If you are an individual maintaining a repository in your spare time it's totally okay to say a week.
- If you are maintaining a company repository, state your working hours in the documentation and make it clear that you won't respond outside of office hours. Make sure you stick to this.

## Best practices for contributors

### Observing repository conventions

Most repositories will have certain conventions that you are expected to follow. These will differ from project to project, and can normally be found in the Readme or Contributing Guide. The areas covered will vary, but common things to look out for include:

- Code style guides
- General conventions for communicating
- Branch naming conventions
- Git workflows

### The work process

Most projects expect some form of discussion before a pull request is made. Expectations vary from project to project and can normally be found in the Readme or Contributing Guide.

Commonly, you should expect to either work on an existing issue, or to make a new issue and await approval from a maintainer before starting work. Many projects make use of labels such as `ready for dev` `not ready for dev` `will not do` to help you work out what issues you can work on. Unless the documentation says otherwise, you should normally comment on an issue that you would like to work on and ask to be assigned to it, and only start work when you have been assigned. This helps to avoid duplication of work and ensures that expectations are aligned. Unless the repository explicitly states that it accepts unsolicited pull requests, or you have good reason to believe your contribution will be accepted (perhaps you know the maintainer personally and they have said it is okay), you should not make unsolicited pull request to a project.

### Communicating with maintainers

Communication is key to working on open source. Most projects have conventions surrounding communication, and these should always be followed. Many projects primarily communicate via comments on issues or pull requests. Some projects have external groups such as Slack channels, a forum, IRC channels or email lists that where communication takes place and work is coordinated. If the project uses these there should be information about this on the Readme or Contributing Guide. If there is no specific information about where to communicate, you can probably assume that communication can take place via issues and pull requests.

Regardless of the tools used to communicate, there are certain things to keep in mind to keep communication effective and respectful, especially in a international online space.

- Always follow the Code of Conduct. Yes, always, even if you disagree with its contents or think it restricts your freedom of speech. The community agreed on these rules to govern the space, and as an entrant to the community you have a responsibility to follow these rules.
- Messages should be kept short and simple. It is often best to keep to 'one message, one topic', although there may be times when this not possible, for example if you need to respond to several points in another message, or you are going to be unavailable for a time and need to communicate several points at once. If you need to discuss several points in one message, put each point in a separate paragraph.
- Disagreement and debate are healthy, but it is important to keep the conversation respectful. Criticize the ideas people express, but don't criticize the person directly.
- Low context communication works best in international, cross-cultural spaces. Meanings should be explicit in the words you use, specific cultural references, cliches and sayings might not be understood by people from different cultures.

### View of work

You should approach open source work with the same professionalism as you would work for an employer, but remember that you are doing this in your spare time and that self-care is important. This means that you should take care over things such as code style, documentation, testing and such like just as you would your work for an employer, but it is okay if you cannot work at a fast pace. If timescales come up in open-source contributions, try to set reasonable expectations from the beginning. Otherwise, time should be taken to be fairly relaxed; for non-trivial issues it should not be expected that you complete the work to a given timescale.

## Guide to Hacktoberfest

Check out the official [Hacktoberfest](https://hacktoberfest.digitalocean.com/) site and our own [Virtual Coffee Hacktoberfest Initiative](https://hacktoberfest.virtualcoffee.io)

Getting the most out of Hacktoberfest as a:

### Contributor

- Ensure you follow the Hacktoberfest rules to earn your official swag.
- Maximize your opportunities to earn swag. In addition to the official Hacktoberfest swag, many companies and organizations give away their own swag to contributors during Hacktoberfest, so watch out for this.
- Many opportunities to earn additional swag come with criteria, so study these carefully.

### Maintainer

- Make sure you add the Hacktoberfest label to your repository to ensure pull requests count toward Hacktoberfest. This also helps potential contributors find your repository.
- If you want to limit attention but still allow your contributors pull requests to count, you can alternatively add 'hacktoberfest-accepted' to individual pull requests.
- Promote your repository during Hacktoberfest on social media using the #Hacktoberfest hashtag and watch out for posts and threads collecting projects.

### Event organizer

- List your event on the official site so people can find out about it.
- Promote your event on social media using the #Hacktoberfest hashtag.

### Company

There are many ways companies can use Hacktoberfest. Some ideas include:

- Running an internal Hacktoberfest initiative for employees. This could involve encouraging employees to contribute to external open source projects, or engaging more employees in internal ones. Companies could offer swag or prizes to employees who successfully complete the challenge.
- Offering company swag to external contributors to company repositories. This can be a great way to increase engagement from the wider community with company open source repositories.

## How to use Git, Github and Gitlab

### Git

#### Basic Git workflows:

Cloning a repository:

To clone a repository, you can run `git clone <Repo>` where the Repo is the URL of the repository. This will set up a copy of the repository on your local computer, with the remote repository you cloned from as the `origin` remote.

Adding another remote:

You will normally clone a forked version of the repository, but you may want to add the original version as a remote as well so you can pull other people's changes into your local repository. This remote is conventionally called `upstream` and can be added using `git remote add upstream <Repo>` where Repo is the URL of the original repository.

Synchronizing changes:

When new changes are merged into the original repository, you should pull them into your local copy. If you have set your `upstream` repository, this can be done using `git pull upstream main`. Some repositories use a name other than `main` for their main branch, in which case you replace `main` with the name it uses. You can pull the main branch directly into your working branch.

When you have made changes on your local machine and you want to submit them via a pull request, you first need to push your changes to your fork using `git push origin your-branch-name`.

#### Advanced Git workflows:

Collaborating with someone on a contribution and synchronizing your work:

Sometimes you may want to work with someone else on a contribution, and both work on your local machine, but submit the work as a single pull request. This is not very common, but if you do find yourself needing to do this, this workflow works:

Assuming that Alice and Bob both have a fork of the project they want to contribute to:

1. Alice adds Bob's fork as a remote on her local repository using `git remote add bob <Bob's Repo URL>`.
2. Bob adds Alice's fork as a remote on his local repository using `git remote add alice <Alice's Repo URL>`.
3. Alice can now pull changes pushed by Bob using `git pull bob branch-name`.
4. Bob can now pull changes pushed by Alice using `git pull alice branch-name`.
5. Either Alice or Bob can submit the pull request once they have all the work on their fork of the project.
6. Each commit will automatically contain either Alice or Bob's name, so each person's contributions can be identified.

### Github

What is Github? Github is a platform for hosting, sharing and collaborating on Git repositories. Gitlab and Bitbucket are to other similar platforms.

You can interact with Github through the web GUI on [github.com](https://github.com). If you prefer working with the command line, there is also a [Github CLI](https://cli.github.com).

#### Getting the most out of your Github profile:

You can make basic customizations of your profile in your settings, add a website and Twitter links, a short bio and customize your pinned repositories to showcase the work you most want the world to see. But to really customize your profile you need to create a repository in your account with the same name as your Github username and pop in a Readme. The contents of that Readme file, in Github-flavored markdown, will be rendered on your profile page. There are all kinds of cool integrations you can add to this readme to do awesome things on your profile. These two articles: [Creating a Killer GitHub Profile README, by Braydon Coyer](https://daily.dev/blog/creating-a-killer-github-profile-readme-part-1) and [How to Create Beautiful GitHub Profil Readme.md, by Indrajeet Nikam](https://fullyunderstood.com/how-to-create-beautiful-github-profile-readmemd/) will hopefully give you some inspiration.

#### Basic Github workflows:

Forking a repository:

If you want to contribute to an open source project, the first step is normally to fork the repository to your own Github profile. This means you create a copy of the repository in your profile so that you can make changes without having to push commits directly to the project repository. The steps to do so are:

1. Click on the fork button on the repository page.
2. You will probably be asked where you want to fork the repository to. Unless you are forking on behalf of an organization, you should click on your personal profile name.
3. Github will then fork the repository to your profile. You can then work with this forked repository going forward.

Cloning a repository to your local computer:

Although you can edit files directly within the Github UI, if you are changing the code you will normally want to clone it to your local computer and work in your favorite IDE. To do this you will need to clone the repository. To do this, click on the green `Code` button on your forked version of the repository. You will then see a dialog with options to clone via HTTPS, SSH or Github CLI. The HTTPS and SSH (Used if you authenticate with Github via SSH, see section below) tabs provide you with the repository URL to insert into the `git clone` command from the Git section above. If you use Github CLI you can simply copy the command and run it in your terminal.

Authenticating with Github:

If you want to work locally with Github repositories, you will need to authenticate your local git with Github (You don't need to do this to simply clone a public repository via HTTPS). You can either use a Personal Access Toke to authenticate over HTTPS ([Instructions here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github#https)) or by using SSH public/private keypairs ([Instructions here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github#ssh)).

Fetching upstream changes:

When contributing to a project, you need to keep your fork up to date with the original, generally known as the upstream repository. You can do this using the Synchronizing Changes Git workflow outlined above, or you can use the `Fetch upstream` button on your fork. This will allow you to either automatically fetch the changes, or choose to compare them first before merging.

Making a pull request:

Once you have done some work on a project and you have your changes in your forked version of the repository, you can now submit the changes to the upstream repository by making a pull request. This allows the maintainers to review your work, make comments and request any necessary changes, and if they are happy, merge your changes into the project codebase. Before making a pull request you should make sure to fetch any upstream changes. The steps to make a pull request are:

1. Either navigate to `Pull Requests` on the upstream repository and click the green `New pull request` button or on you forked repository, select the branch you'd like to submit, click on `contribute` and then `Open pull request`. If you have recently pushed changes to Github, you should also see a banner at the top of the page with a `Compare and pull request` button you can click on.
2. You will then get taken to the Open pull request form, where you can create a description of your pull request. Here you should check out the project's Contributing guidelines and follow any conventions described. Many projects will have a pull request template to help you get it right.
3. Once you are ready, click `Create pull request`. Congratulations, you have made your pull request 🎉.
4. If a maintainer requests changes you can make the requested changes and push new commits to the same branch and they will automatically be added to the pull request.

## Gitlab

<!-- I would need help here since I have no experience with Gitlab -->

## What is open source

Open source is defined by a number of cultural and legal factors.

Code is generally made freely available, both in the sense that it is accessible for public view, and that it is distributed under a copyright license that permits reuse, modification and redistribution. There are a variety of different licenses in common use, some of which grant almost complete freedom, including to incorporate code into commercial, closed-source projects, while others may be more restrictive, for example by requiring that projects the code is incorporated into are themselves released under the same license. The boundary between open source and closed source can be a matter of debate, with some projects released under licenses that are not universally accepted as open source.

There is a culture in open source of building off of each other's work. You can take an open source project and extend it or incorporate it into another project, as long as you comply with the terms of the license. Package managers such as NPM can also be used to incorporate other open source code into your project.

The ecosystem of open source software is vast, ranging from GUI programs through libraries and modules designed to provide specific functionality to other programs, frameworks and programming languages themselves, platform infrastructure behind decentralized social networks, blockchain protocols and simple personal projects and creative coding.

Although best known in software, the concepts of open source can extend to any field with intellectual property, and there is a developing open source scene in hardware, design systems, and designs for 3D printable goods among other fields. This guide primarily deals with the software field, but the principles could be applicable to any open source field.

## Funding and governance in open source

### Funding models

There are a number of different models for funding the running and development of open source projects:

- Some projects are run as personal projects of their creator, with any costs being met out of the creators own pockets and work being done by the creator and other volunteer contributors. Sometimes these projects may use something like Github Sponsors or other sites allowing people to donate small amounts to cover costs or compensate the creator for their time.
- Larger projects with a team of maintainers or a non-profit behind them may use the same funding model but will often supplement this with more ways to donate. Maintainers and contributors of these projects will also normally be volunteers, with money raised being typically used to cover costs such as website hosting or costs of services the organization uses.
- Some projects are entirely funded by a company or organization that is also the maintainer of the project alongside their core business. These projects typically use a combination of paid team members and volunteer contributors to get work done. Some projects are entirely developed by a paid in-house team and don't normally receive external contributions, but are released to the public under an open source license.
- Some projects form the core part of a commercial enterprise, with the company typically making money from providing support, paid licenses with additional capabilities or paid services that incorporate the open source project. These projects typically have the majority of the work done by a paid in-house team but may also accept external volunteer contributions.

### Governance models

There are a number of different models for governance of open source projects:

- A very common model is the "Benevolent Dictatorship", where a single project creator makes or leads the decision making process. They may consult and take input from the community, but ultimately all authority rests with the benevolent dictator.
- Some projects are governed by various non-profit organizational structures, which will commonly have at least an agreed upon set of rules for decision making. Larger projects may be run by incorporated organizations with a formal constitution and official positions, along with a member or committee structure to administer the organization and make decisions.
- Projects backed by a single company will typically be governed by the internal procedures of the company, although a few may have a legally separate organization allowing for community involvement or ownership of the project.
- Projects such as programming languages or platform standards will often be governed by a foundation with corporate or individual members who have an interest in the project and who appoint a core team or committee that administers the organization and makes decisions.
- In the blockchain and cryptocurrency space Distributed Autonomous Organizations (DAOs) are emerging as a popular choice. While the details differ from project to project, these will typically feature a governance token on a blockchain that can be transferred and/or bought and sold, whose holders are allowed to vote on proposals.

## How to use open source to build your resume / building your career with open source

<!-- I would like some input on what to include in this section -->

## Open sourcing an existing project

If you want to open source your project and encourage contributions from the community, you should follow our [Maintainers Checklist](./oss-maintainer-checklist.md).

If you simply want to open source your project so that other people can freely use the fruits of your labor, you don't have to do everything on the Maintainers Checklist.

It is a good idea to follow the following from the Maintainers Checklist, but you don't have to follow all of them for your project to be a valid open source project:

- ✅ It should have a relevant name.
- ✅ It should have a clear description that tells you what the project does and what it's for.
- ✅ It should have relevant tags highlighting its scope/stack/field etc.
- ✅ It should have a README. The README should link to or describe:
  - Project purpose and context
  - Installation instructions
- ✅ A valid OSS license (Essential. Period. Your project is not open source if you don't have a valid OSS license.)
- ✅ Issue templates if you are open to feedback or feature requests from users
- ✅ A Code of Conduct: Even if you are not expecting contributions you may still get public activity on your repo, for example on issues, and a Code of Conduct helps you to set boundaries and keep conversations respectful.

{% endtextContainer %}
