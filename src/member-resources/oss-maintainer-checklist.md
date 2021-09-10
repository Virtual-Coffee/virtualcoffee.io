---
layout: layouts/default.njk
title: Open Source Software Maintainer Checklist
description: A handy checklist for Open Source maintainers!
heroHeader: 'Open Source Software Maintainer Checklist'
heroSubheader: A handy checklist for Open Source maintainers!
tags: memberresources
---

{% textContainer 'light'%}

# What is this document for?

{% leadText %}
This document is a short and simple guide to help you determine if a GitHub repository is a good fit for contributing to open source. We highlight key areas and considerations to help you evaluate whether or not you want to contribute to an open source project.

This also doubles as our very own guide for Virtual Coffee-endorsed Open Source projects.
{% endleadText %}

---

## Table of Contents:

${toc}

---

## Name, Description, Tags

We'll start with the natural beginning for evaluating an OSS project: The descriptive fields that GitHub provides.
  - It should have a relevant name.
  - It should have a clear description that tells what the project does and what it's for.
  - It should have relevant tags highlighting its scope/stack/field etc.

These are first and most straightforward way GitHub uses to recommend your content to potential contributors.*

* Also, if you're looking to particpate in [Hacktoberfest](https://hacktoberfest.digitalocean.com/), adding the `Hacktoberfest` tag to your repo description is one especially important way to indicate that.

![A good open source description](https://user-images.githubusercontent.com/13292886/132138464-242c7d64-8b64-4595-b045-8bf028638b43.png)

## Docs, Docs, Docs,

At the end of the day, all we know of a project before we start it is what we say and what the maintainer tells us. Having good documentation is the best indicator that a project is well maintained, well supported, and has a healthy and active community. There are a plethora of materials a repo can utilize to provide context to potential contributors, but the docs that matters most are:
 - **The README** - This is the face of your repo. It's the first thing anyone sees, after maybe the name and description, and it's the nexus for all content, links, docs, and other project associations. A project without a README is probably not ready for accepting contributions. Some basic things you should include in your README are:
    - A more detailed description of the project than the description field in GitHub;
    - How to install/run your application or a link to the document that explains it;
    - A link to the Code of Conduct;
    - Project status, roadmap, and any other pertinent details for those interested in using or contributing to the app.
 - **The Code of Conduct** - The code of conduct (often referred to as the **COC**) is an excellent indicator of healthy contributor's environment. There are many Code of Conduct styles online and many projects use one of the standard templates (which is fine). But it's always worth taking a look at a project's Code of Conduct before starting any contribution work. Not every OSS project may necessarily have one though; some maintainers opt to simply describe appropriate behavior in the README.
 - **The Contributing Guide** - Last but certainly not least, there should be some discussion of how to contribute to the project. Some folks write these instructions directly in the README which _can_ be alright, but we prefer an explicit document that highlights:
    - How to install and run the application, the more detailed the better;
    - What is the recommended process for making issues/submitting pull requests;
    - What to do if you feel like somebody is violating the Code of Conduct;
    - How to communicate with maintainers? How often should you expect interactions/reviews and through what mediums.
 - **A License** - There are many [popular and vetted open source licenses](https://opensource.org/licenses) that make it easy and safe for people to contribute to a particular project. It is not advised to work on a project without that doesnt have a license, or is not using one of these.
 - **Issue and Pull Request templates** - These are templates that provide a guide for potential contributors on make issue and pull requests respectively to the project. They remove a lot of burden from the maintainer and the contributor one trying to guess the appropriate procedure for these contributions.

![Templates](https://user-images.githubusercontent.com/13292886/132138524-0a38d35c-305e-4804-ba36-e7adfa73e09d.png)

## Beginner Friendliness
Ultimately, if you're looking for a repository/project that is beginner friendly, they should have some indication in the documentation and processes that highlights that. 

- Call to action - Some repositories say "contributions welcome/beginner friendly" in the README or have tags on issues like, `just for beginners`. Either way, there should be some indication that they do want someone to help.
- Healthy interactions with contributors - If this project isn't new, it likely has some history of contributions from other people. Looking at those interactions and how the maintainers work with contributors is a great way to get the "vibe" of the project. How often do maintainers respond? How do they respond? Are people appreciated for their work?
- Clear tagging system in issues. The easier it is to navigate the project issues and resources, the more friendly it is for new contributors.

*Note that everyone has a slightly different defintion of "beginner friendly", so the experience may vary in different repositories.*

## Final Thoughts

There are _many_ other things that can help make a repository feel more welcoming, like demos, video guides, etc., but this document is meant to address the **minimum** requirements. When Virtual Coffee determines the projects we highlight and recommend to our members, these are the things we look for and why. Hopefully, it can serve as a guide to anyone who finds this document.

## The Official Checklist
Here's the checklist in plain form based on the guide above. It isn't necessary for a project in the wild to have *all* of these things, but it should have most of them.

- It should have a relevant name.
- It should have a clear description that tells you what the project does and what it's for.
- It should have relevant tags highlighting its scope/stack/field etc.
- Also, if participating in [Hacktoberfest](https://hacktoberfest.digitalocean.com/), the `hacktoberfest` topic should be placed in the project description, or the `hacktoberfest-accepted` label added to accepted pull requests
- It should have a README. The README should link to or describe:
    - Project purpose and context
    - Installation instructions
- Contributions/Contributing guide:
    -  What is the recommended process for making issues/submitting pull requests
    -  How to communicate with maintainers.
- A valid OSS license
- A Code of Conduct
- Issue and Pull request templates


## Additional Resources
[The Guide to Building Open Source Communities](https://opensource.guide/building-community/)

[Introduction to Open Source](https://www.digitalocean.com/community/tutorial_series/an-introduction-to-open-source)

{% endtextContainer %}
