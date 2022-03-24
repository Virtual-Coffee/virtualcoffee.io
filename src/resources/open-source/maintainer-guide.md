---
layout: layouts/resources.njk
title: Maintainer Guide
description: A Virtual Coffee guide to maintaining Open Source projects.
hero: 'svg/undraw_To_do_list_re_9nt7.svg'
heroHeader: 'Maintainer Guide'
heroSubheader: 'A Virtual Coffee guide to maintaining Open Source projects.'
tags: memberresources
eleventyNavigation:
  key: MaintainerGuide
  title: Maintainer Guide
  excerpt: A Virtual Coffee guide to maintaining Open Source projects.
  parent: OSS
  order: 4
---

{% textContainer %}

# What is this document for?

{% leadText %}

This document is Part 4 of Virtual Coffee's four-part Guide to Open Source, outlining useful information for you open source maintaining journey.

{% endleadText %}

{% endtextContainer %}

{% textContainer 'white' %}

<h2>Table of Contents</h2>

${toc}

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
