# Introduction

Thank you for so much for considering contributing to this repostory. We really appreciate all the contributors who try to make this space better. This document serves as a guide that will show you the path of least resistance for making valuable contributions to this project. Reading and following this guide shows that you respect the time of the developers managing and developing this space. In return, they will reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests. This is the only way we can produce anything of value.

If you're looking to start learning how to work with this repo, this doc tries to provide all the resources to get you from confusion to productivity.

We're not here to reinvent the wheel, so where we feel appropriate, we reference and link to resources we feel do a good job of helping a newbie through that particular section of setup.

Most of the docs are currently written using [markdown](https://www.markdownguide.org/basic-syntax/) to make it easy to add, modify, and edit what we need to.

We try not to take anything for granted, but in case we miss something, please reach out to the maintainers and let us know!

We really want to make it as easy as possible for newbies to start helping out and docs like this provide a valuable resource for them to use.

# Table of Contents
- [Introduction](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#introduction)
- [What type of contributions are desired](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#what-type-of-contributions-are-desired)
- [The Basics](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#the-basics)
  - [Making a Github Account](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#making-a-github-account)
  - [Working with Issues](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#working-with-issues)
  - [Install and Run](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#run-and-install)
  - [Making Pull Requests](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#creating-a-pull-request)
  - [Awaiting Review](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#awaiting-review)
  - [Tips and Gotchas](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#tips-and-gotchas)
- [Bug Reporting](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#reporting-a-bug)
- [Preffered code style](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#preferred-code-style)
- [Commit message conventions](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#commit-message-conventions)
- [Labelling conventions](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#labelling-conventions)

# What type of contributions we're looking for.

This is an open source project and we love to receive contributions from our community — you! There are many ways to contribute,
from writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests,
or writing code which can be incorporated into the application codebase itself.

# Asking to Pair

This is a beginner friendly repo. Contributors can request a pairing (zoom/google hangouts) to pair with a maintainer on tackling an issue/submitting a PR/etc. If you want to do it for a pre-existing issue, simple indicate so in a comment under that issue. If not, you may open a new Question issue and request a pairing. Please understand that this is a volunteer effort; maintainers may not always be available for pairing.

# The Basics

## Setting up a Github Account

We're going to assume you know what [github](https://www.howtogeek.com/180167/htg-explains-what-is-github-and-what-do-geeks-use-it-for/) is about and how it works (otherwise, how would you be reading this?)

If you haven't made a github account as yet, make one [now](https://github.com). It's free!

## Working With Issues

Github uses a feature called _issues_. Issues are essentially a way to highlight bugs, features, problems, or any sort of suggestion or action you wish to happen on a github hosted project (you can find a more comprehensive explanation [here](https://guides.github.com/features/issues/)).

We highly recommend looking at the existing reository issues to find a good open issue to start with. We always try to keep them populated with some beginner friendly issues that anyone can attempt to solve. We also use a `PR Submitted` tag to indicate when an Pull Request has been submitted for an issue, but it hasn't yet been merged, as most people would rather would on an issue with no attempted PRs yet.

If you feel like there's a contribution you would like to make that isn't represented by an already existing issue, feel free to create your own! We have four issue templates that you can use which provide some (hopefully) helpful guidelines on how to form your issues. They are:
 - FEATURE
 - BUG
 - QUESTION
 - DOCUMENTATION

The meanings for those are hopefully pretty self explanatory. If you feel like you have an issue that doesnt match those categories though, go ahead and ignore the templates and create an issue the old fashioned way.

## Run and Install

1. If you don't have it already, download and install
  - [NODE.js](https://nodejs.org/en/download/) and
  - [yarn](https://classic.yarnpkg.com/en/docs/install/)
2. Fork this repo
3. Create a local copy on your machine
4. In a shell terminal/command line, navigate to the repository
5. Run the live development server with:

```
yarn start
```

## Creating a Pull Request
At this point, you have two options.

**The first option** is using the github interface to fork the repo, making an edit right here in the github client, and then submit a Pull Request (no code or terminals or IDE required). [This guide](https://guides.github.com/activities/hello-world/) shows just how to do that for a small personal repo. You would simply replace the step of creating a new repository to just navigating to this one and forking that instead. This is a great idea if you simply plan to add to or edit one of the markdown files we use for documentation in this project.

**The second option** is go the traditional route of forking the repo, creating a local copy of that fork, and working on your changes that way. This is also the only way to go if this project expands to include an associated application. For that we recommend [this guide](https://www.dataschool.io/how-to-contribute-on-github/).

**Note:** The guide referenced above uses _master_ as the naming convention for the default branch in all its repos. In this project, _main_ is the default branch name. When following the instructions in the guide, simply replace _master_ with _main_ wherever it appears and it should proceed as normal. [this guide](https://www.hanselman.com/blog/EasilyRenameYourGitDefaultBranchFromMasterToMain.aspx) can help you transition with your own personal repos from master to main, and explains the methodology as to why you should.

## Awaiting Review

Once you've submitted your pull request, the only thing left is to wait from feedback from one of the project maintainers. Since this is volunteer work for all of course, we ask for patience if you don't see a response immediately. Sometimes it takes about a day for someone's schedule to clear up to have the sit to properly review incoming PRs. We'd rather not rush a response after someone has put time and effort into submitted. If it's been over **one week** and you haven't received any acknowledgement, you can post a comment on your PR reminding of it's status.

If the PR looks good, a maintainer will typically give feedback and merge the request immediately, otherwise they'll let you know what questions they have or what needs to change before your work can be accepted. Once it is, you'll see your changes on the main branch and VOILA, open source contribution complete!

## Tips and Gotchas

This section is just little notes and bits of info that can smooth over some of the bumps and hiccups that can come along with contributiong.

- While this isn't absolutely required, we highly recommend **associating your Pull Requests with the Issue that they're intended to address**. This makes review much easier and avoids confusion when looking back at past commits. Github allows you to link a PR to an issue both during and after the PR's creation (the option should located in rightmost panel of the github PR interface).
- **Please do not hesitate to ask for help** in any part of this process if you feel confused. As soon as they can, project maintainers can try and get you through the parts which are confusing you. Just be aware that no one here is a github expert :), we're just folks happy and willing to help others get some experience.
- Be extra careful when working with git in the command line. Incorrectly typed names or commands can have strange results, and navigating git issues can be very perplexing. Fortunately, there's a plethora of resources on fixing said issues, and rest assured that any error you make has already been done, and solved, by someone.

That's all for now. If you feel like anything is missing from this document that you wish were included, let us know. Or hey, open up a fresh issue and take a shot at helping us make it better!


# Reporting a bug

We have a bug report template already created for your use. Just select it when opening up an issue on github and follow the headers to formulating your issue.

When filing an issue, make sure to answer these three questions:

- What did you do?
- What did you expect to see?
- What did you see instead?



# Labelling Conventions

This repository has three basic types of labels:
- `Type` - The nature of the issue. BUG, FEATURE, QUESTION, or DOCUMENTATION (will be pre-assigned if using issue templates). Only one active per issue
- `Status` - What part of the process is this issue in. e.g. Active, Needs Review, Resolved, etc. (will be filled in by maintainers and some contributors). Only one active per issue.
- `Context` - Additional info that helps people parse issues. e.g. "good first issue", "for maintainer only". Multiple may be active on one issue.
