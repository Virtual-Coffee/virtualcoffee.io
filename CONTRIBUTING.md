# Contributors Guide

Welcome to the Virtual Coffee contributors guide! Thank you for so much for considering contributing to this repository. We really appreciate all the contributors who try to make this space better. This document serves as a guide that will show you the path of least resistance for making valuable contributions to this project. Reading and following this guide shows that you respect the time of the developers managing and developing this space. In return, they will reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests. This is the only way we can produce anything of value.

We take our [Code of Conduct](https://virtualcoffee.io/code-of-conduct/) very seriously, and all contributors must abide by it. Let’s treat each other with respect and remember we are all people who care and are trying. With that said, if you believe someone has violated the Code of Conduct, please fill out our [CoC Violation Form](https://virtualcoffee.io/report-coc-violation/), which you can do anonymously.

As an open source community, Virtual Coffee recognizes the importance of supporting our members and creating clear paths of communication. We know that sometimes things get lost in translation and we want to assume positive intent.

## Getting Started

Before you begin:

- Have you read our [Code of Conduct](https://virtualcoffee.io/code-of-conduct/)?
- Check out [existing issues](https://github.com/Virtual-Coffee/virtualcoffee.io/issues) and the [discussion board](https://github.com/Virtual-Coffee/virtualcoffee.io/discussions) to ensure your issue hasn’t been brought up before.

If you're looking to start learning how to work with this repo, this doc tries to provide all the resources to get you from confusion to productivity.

We're not here to reinvent the wheel, so where we feel appropriate, we reference and link to resources we feel do a good job of helping a newbie through that particular section of setup.

Most of the docs are currently written using [markdown](https://www.markdownguide.org/basic-syntax/) to make it easy to add, modify, and edit what we need to.

We try not to take anything for granted, but in case we miss something, please reach out to the maintainers and let us know!

We really want to make space for all developers to feel comfortable and supported while contributing, and docs like this provide a valuable resource for them to use.

# Table of Contents

- [Contrubutors Guide](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#contributors-guide)
- [Getting Started](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#getting-started)
- [What type of contributions are desired](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#what-type-of-contributions-are-desired)
- [The Basics](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#the-basics)
  - [Making a Github Account](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#making-a-github-account)
  - [Discussions](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#discussions)
  - [Working with Issues](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#working-with-issues)
  - [Local development](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#local-development)
  - [Making Pull Requests](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#creating-a-pull-request)
  - [Awaiting Review](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#awaiting-review)
  - [Suggested Changes](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#suggested-changes)
  - [Tips and Gotchas](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#tips-and-gotchas)
- [Bug Reporting](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#reporting-a-bug)
- [Labelling conventions](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/CONTRIBUTING.md#labelling-conventions)

# What type of contributions we're looking for.

This is an open source project and we love to receive contributions from our community — you! There are many ways to contribute, from writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests,
or writing code which can be incorporated into the application codebase itself.

# Asking to Pair

This is a beginner friendly repo. Contributors can request a pairing (zoom/google hangouts) to pair with a maintainer on tackling an issue/submitting a PR/etc. If you want to do it for a pre-existing issue, simple indicate so in a comment under that issue. If not, you may open a new Question issue and request a pairing. Please understand that this is a volunteer effort; maintainers may not always be available for pairing.

# The Basics

## Setting up a Github Account

We're going to assume you know what [github](https://www.howtogeek.com/180167/htg-explains-what-is-github-and-what-do-geeks-use-it-for/) is (otherwise, how would you be reading this?).

If you haven't made a github account as yet, make one [now](https://github.com). It's free!

## Discussions

For questions, comments, or other discussion topics that don’t have a clear action, please use the [discussion board](https://github.com/Virtual-Coffee/virtualcoffee.io/discussions).

For example, if you want to ask “Should we do…” or “How do I do…”, you’ll start in the discussion board. This allows a whole-group conversation, and we can integrate the answer into docs or issues as necessary.

## Working With Issues

Github uses a feature called _issues_. Issues are essentially a way to highlight bugs, features, problems, or any sort of suggestion or action you wish to happen on a github hosted project (you can find a more comprehensive explanation [here](https://guides.github.com/features/issues/)).

We highly recommend looking at the existing repository issues to find a good open issue to start with. We always try to keep them populated with some beginner friendly issues that anyone can attempt to solve. 

If you find an issue you would like to work on, comment on the issue and a maintainer will respond and/or assign it to you. It can't be assigned to you unless you've commented on the issue.

We also use a `PR Submitted` tag to indicate when an Pull Request has been submitted for an issue, but it hasn't yet been merged, as most people would rather would on an issue with no attempted PRs yet.

If you feel like there's a contribution you would like to make that isn't represented by an already existing issue, feel free to create your own! We have four issue templates that you can use which provide some (hopefully) helpful guidelines on how to form your issues. They are:

- FEATURE
- BUG
- QUESTION
- DOCUMENTATION

If you feel like you have an issue that doesn't match those categories though, go ahead and ignore the templates and create an issue the old fashioned way.

## Local development

Follow the steps for local development [in our README](README.md#local-development)

## Creating a Pull Request

> ⚠️ **Heads up!** If you'd like to make a Pull Request, please make sure you've created an issue (or a discussion board post) first, and **that you've been assigned to the issue**. This allows the maintainer team to provide guidance and prioritize tasks — otherwise you may run the risk of spending time on something that doesn't end up getting accepted for various reasons.

We appreciate everyone’s efforts, and want to ensure that our communication is clear and open as much as possible. We strongly encourage communication and clarity before doing work.

Once you've been assigned the issue, you have two options.

**The first option** is using the github interface to fork the repo, making an edit right here in the github client, and then submit a Pull Request (no code or terminals or IDE required). [This guide](https://guides.github.com/activities/hello-world/) shows just how to do that for a small personal repo. You would simply replace the step of creating a new repository to just navigating to this one and forking that instead. This is a great idea if you simply plan to add to or edit one of the markdown files we use for documentation in this project.

**The second option** is go the traditional route of forking the repo, creating a local copy of that fork, and working on your changes that way. This is also the only way to go if this project expands to include an associated application. For that we recommend [this guide](https://www.dataschool.io/how-to-contribute-on-github/).

**Note:** The guide referenced above uses _master_ as the naming convention for the default branch in all its repos. In this project, _main_ is the default branch name. When following the instructions in the guide, simply replace _master_ with _main_ wherever it appears and it should proceed as normal. [This guide from Scott Hanselman](https://www.hanselman.com/blog/EasilyRenameYourGitDefaultBranchFromMasterToMain.aspx) can help you transition with your own personal repos from master to main, and explains the methodology as to why you should.

## Awaiting Review

Once you've submitted your pull request, the only thing left is to wait from feedback from one of the project maintainers. Since this is volunteer work for all of course, we ask for patience if you don't see a response immediately. Sometimes it takes about a day for someone's schedule to clear up to have the sit to properly review incoming PRs. We'd rather not rush a response after someone has put time and effort into submitted. If it's been over **one week** and you haven't received any acknowledgement, you can post a comment on your PR reminding of it's status.

The purpose of reviews is to create the best experience we can for our contributors.

- Reviews are always respectful, acknowledging that everyone did the best possible job with the knowledge they had at the time.
- Reviews discuss content, not the person who created it.
- Reviews are constructive and start conversation around feedback.

If the PR looks good, a maintainer will typically give feedback and merge the request immediately, otherwise they'll let you know what questions they have or what needs to change before your work can be accepted. Once it is, you'll see your changes on the main branch and VOILA, open source contribution complete!

### Suggested Changes

We may ask for changes to be made before a PR can be merged, either using [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request) or pull request comments. You can apply suggested changes directly through the UI. You can make any other changes in your fork, then commit them to your branch.

As you update your PR and apply changes, mark each conversation as [resolved](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/commenting-on-a-pull-request#resolving-conversations).


## Tips and Gotchas

This section is just little notes and bits of info that can smooth over some of the bumps and hiccups that can come along with contributing.

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
