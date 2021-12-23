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

## Maintainers checklist

- existing

## Contributors checklist

- based on maintainers checklist, but reoriented toward helping contributors evaluate a repository

## Best practices for maintainers

### building community

### avoiding burnout

Maintaining an open source project can be a lot of work, and many people do it on the side as well as their "day job". It is important not to be mindful of the risk of burnout and take steps to keep the work at a manageable level.

Good steps to take include:

- Figure out a reasonable time frame for responding to issues and pull requests, and include it in your documentation. If you are an individual maintaining a repository in your spare time it's totally okay to say a week.
- If you are maintaining a company repository, state your working hours in the documentation and make it clear that you won't respond outside of office hours. Make sure you stick to this.
-

### communicating with contributors

Communication is key to running a successful open source project. Establish conventions for communications early on and make sure these are clearly documented. Many projects communicate via issues and pull requests, while some use external platforms such as Slack channels, a forum, IRC channels or email lists. All are valid ways to communicate, the important thing is to figure out what is most appropriate for your project. If you are unsure what is best and have no reason not to, using issues and pull requests is a solid choice. If you are maintaining a company project that is open to external contributors, care should be taken to coordinate internal and external communication so that team members and outside contributors are on the same page.

Regardless of the tools used to communicate, there are certain things to keep in mind to keep communication effective and respectful, especially in a international online space.

- Your repository should have a Code of Conduct, and all communication should follow the Code of Conduct.
- Messages should be kept short and simple. It is often best to keep to 'one message, one topic', although there may be times when this not possible, for example if you need to respond to several points in another message, or you are going to be unavailable for a time and need to communicate several points at once. If you need to discuss several points in one message, put each point in a separate paragraph.
- Disagreement and debate are healthy, but it is important to keep the conversation respectful. Criticize the ideas people express, but don't criticize the person directly.
- Low context communication works best in international, cross-cultural spaces. Meanings should be explicit in the words you use, specific cultural references, cliches and sayings might not be understood by people from different cultures.

### managing expectations

## Best practices for contributors

### observing repository conventions

Most repositories will have certain conventions that you are expected to follow. These will differ from project to project, and can normally be found in the Readme or Contributing Guide. The areas covered will vary, but common things to look out for include:

- Code style guides
- General conventions for communicating
- Branch naming conventions
- Git workflows

### The work process

Most projects expect some form of discussion before a pull request is made. Expectations vary from project to project and can normally be found in the Readme or Contributing Guide.

Commonly, you should expect to either work on an existing issue, or to make a new issue and await guidance from a maintainer before starting work. Many projects make use of labels such as `ready for dev` `not ready for dev` `will not do` to help you work out what issues you can work on. Unless the documentation says otherwise, you should normally comment on an issue that you would like to work on and ask to be assigned to it, and only start work when you have been assigned. This helps to avoid duplication of work and ensure that expectations are aligned. Unless the repository explicitly states that it accepts unsolicited pull requests, or you have good reason to believe your contribution will be accepted (perhaps you know the maintainer personally and they have said it is okay), you should not make unsolicited pull request to a project.

### communicating with maintainers

Communication is key to working on open source. Most projects have conventions surrounding communication, and these should always be followed. Many projects primarily communicate via comments on issues or pull requests. Some projects have external groups such as Slack channels, a forum, IRC channels or email lists that where communication takes place and work is coordinated. If the project uses these there should be information about this on the Readme or Contributing Guide. If there is no specific information about where to communicate, you can probably assume that communication can take place via issues and pull requests.

Regardless of the tools used to communicate, there are certain things to keep in mind to keep communication effective and respectful, especially in a international online space.

- Always follow the Code of Conduct. Yes, always, even if you disagree with its contents or think it restricts your freedom of speech. The community agreed on these rules to govern the space, and as an entrant to the community you have a responsibility to follow these rules.
- Messages should be kept short and simple. It is often best to keep to 'one message, one topic', although there may be times when this not possible, for example if you need to respond to several points in another message, or you are going to be unavailable for a time and need to communicate several points at once. If you need to discuss several points in one message, put each point in a separate paragraph.
- Disagreement and debate are healthy, but it is important to keep the conversation respectful. Criticize the ideas people express, but don't criticize the person directly.
- Low context communication works best in international, cross-cultural spaces. Meanings should be explicit in the words you use, specific cultural references, cliches and sayings might not be understood by people from different cultures.

### view of work

You should approach open source work with the same professionalism as you would work for an employer, but remember that you are doing this in your spare time and that self-care is important. This means that you should take care over things such as code style, documentation, testing and such like just as you would your work for an employer, but it is okay if you cannot work at a fast pace. If timescales come up in open-source contributions, try to set reasonable expectations from the beginning. Otherwise, time should be taken to be fairly relaxed for non-trivial issues it should not be expected that you complete the work to a given timescale.

## Guide to Hacktoberfest

- VCHI and Hacktoberfest sites.

Getting the most out of Hacktoberfest as a

### Contributor

- Ensure you follow the Hacktoberfest rules to earn your official swag.
- Maximize your opportunities to earn swag. In addition to the official Hacktoberfest swag, many companies and organizations give away their own swag to contributors during Hacktoberfest, so watch out for this.
- Many opportunities to earn additional swag come with criteria, so study these carefully.
-

### Maintainer

- Make sure you add the Hacktoberfest label to your repository to ensure pull requests count toward Hacktoberfest. This also helps potential contributors find your repository.
- If you want to limit attention but still allow your contributors pull requests to count, you can alternatively add 'hacktoberfest-accepted' to individual pull requests.
- Promote your repository during Hacktoberfest on social media using the #Hacktoberfest hashtag and watch out for posts and threads collecting projects.
-

### Event organizer

- List your event on the official site so people can find out about it.
- Promote your event on social media using the #Hacktoberfest hashtag.

### Company

There are many ways companies can use Hacktoberfest. Some ideas include:

- Running an internal Hacktoberfest initiative for employees. This could involve encouraging employees to contribute to external open source projects, or engaging more employees in internal ones. Companies could offer swag or prizes to employees who successfully complete the challenge.
- Offering company swag to external contributors to company repositories. This can be a great way to increase engagement from the wider community with company open source repositories.
-

## How to use Git, Github and Gitlab

### Git

Basic Git workflows:

Cloning a repository:

To clone a repository, you can run `git clone <Repo>` where the Repo is the URL of the repository. This will set up a copy of the repository on your local computer, with the remote repository you cloned from as the `origin` remote.

Adding another remote:

You will normally clone a forked version of the repository, but you may want to add the original version as a remote as well so you can pull other people's changes into your local repository. This remote is conventionally called `upstream` and can be added using `git remote add upstream <Repo>` where Repo is the URL of the original repository.

Synchronizing changes:

When new changes are merged into the original repository, you should pull them into your local copy. If you have set your `upstream` repository, this can be done using `git pull upstream main`. Some repositories use a name other than `main` for their main branch, in which case you replace `main` with the name it uses. You can pull the main branch directly into your working branch.

When you have made changes on your local machine and you want to submit them via a pull request, you first need to push your changes to your fork using `git push origin your-branch-name`.

Advanced Git workflows:

Collaborating with someone on a contribution and synchronizing your work:

Sometimes you may want to work with someone else on a contribution, and both work on your local machine, but submit the work as a single pull request. This is not very common, but if you do find yourself needing to do this, this workflow works:

Assuming that Alice and Bob both have a fork of the project they want to contribute to:

1. Alice adds Bob's fork as a remote on her local repository using `git remote add bob <Bob's Repo URL>`.
2. Bob adds Alice's fork as a remote on his local repository using `git remote add alice <Alice's Repo URL>`.
3. Alice can now pull changes pushed by Bob using `git pull bob branch-name`.
4. Bob can now pull changes pushed by Alice using `git pull alice branch-name`.
5. Either Alice or Bob can submit the pull request once they have all the work on their fork of the project.
6. Each commit will automatically contain either Alice or Bob's name, so each person's contributions can be identified.

- Github
- Gitlab <!-- I would need help here since I have no experience with Gitlab -->

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

### Decision making

## How to use open source to build your resume / building your career with open source

<!-- I would like some input on what to include in this section -->

## Open sourcing an existing project

If you want to open source your project and encourage contributions from the community, you should follow our [Maintainers Checklist](todo).

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
