---
layout: layouts/resources.njk
title: Contributor Guide
description: A Virtual Coffee guide to contributing to Open Source!
hero: 'svg/undraw_To_do_list_re_9nt7.svg'
heroHeader: 'Contributor Guide'
heroSubheader: 'A Virtual Coffee guide to contributing to Open Source!'
tags: memberresources
eleventyNavigation:
  key: ContributorGuide
  title: Contributor Guide
  excerpt: A Virtual Coffee guide to contributing to Open Source!
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

{% endtextContainer %}
