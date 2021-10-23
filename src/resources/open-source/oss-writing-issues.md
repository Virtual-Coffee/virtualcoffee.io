---
layout: layouts/resources.njk
title: How to Write a Good Issue
description: A best practices guide for how to create issues.
hero: 'svg/undraw_fixing_bugs_w7gi.svg'
heroHeader: 'How to Write a Good Issue'
heroSubheader: A best practices guide for how to create issues.
tags: memberresources
eleventyNavigation:
  key: WritingIssues
  title: Writing Issues
  parent: OSS
  excerpt: A best practices guide for how to create issues.
  order: 2
---

{% textContainer 'light'%}

<h2>Table of Contents</h2>

${toc}

---

## Important things to know

There is not one good way to write issues. But there are things we want to avoid that either will discredit what we want or need, or won't help the person who will try to solve the issue.

Some important things to remember:

- **Provide facts.** An issue needs facts, which can include pictures, metrics, and more. It is easier to explain than just using words.
- **Describe the issue.** Follow any templates provided by the organization and/or asking yourself: What, Where, When, How and Why.
- **Don't solve the issue.** You are not expected to solve the issue. It happens of course, but it's important that the issue is clearly describes so that anyone can understand it without being in your head. 🙂

A suggested solution can be a good thing, especially to help the contributors who have less experience. When you're writing issues on a repository that isn't your own, you might not have all of the context to provide the best solution. This is why, although suggestions are appreciated, the maintainers have the final say in the solution and/or approach to the issue.

---

### Tips Before Writing an Issue

- Check the repository's ReadMe and Contributing guide (if they have one) to learn about how the maintainers expect communication and issues to be created. For example, some repositories require you to start a discussion before making an issue.
- Check current issues and closed issues to make sure no one has already written the issue you're going to write.
- If the organization has discussions enabled, check to see if it's been mentioned there as well.
- Check the Code of Conduct (commonly abbreviated as "COC") to make sure you participate in a way that's consistent with the organization's guidelines. Absence of a COC is unfortunate but doesn't mean people should be rude or disrespectful, even if the issue is _super frustrating_.

{% endtextContainer %}

{% textContainer %}

## How to write an issue?

Remember, there isn't one way to do it. We're going to walk you through how to create an issue, and reference the Virtual Coffee repository as an example.

1. Go to a repository. Let's check out [Virtual Coffee repository](https://github.com/Virtual-Coffee/virtualcoffee.io/)
2. Navigate to the [Issue Tab](https://github.com/Virtual-Coffee/virtualcoffee.io/issues/)
3. Check is if there is an [available template](https://github.com/Virtual-Coffee/virtualcoffee.io/issues/new/choose). You can find this by clicking the New Issue button on a repository.
   - In repos that are used to get a lot of traffic and issues, there is often an automatic template that appears when you create the issue. In that case, follow exactly the steps and requirements.
4. If there are no specific rules, here is a list of what's good to share in different types of issues:

### Bug Issue

- Screenshots of the issue is in the UI, logs if it's a performance issue, or anything that proves the existence of the problem.
- **Your setup:** type of device and OS version, type of browser and version, any kind of setup that can help reproducing the problem.
- **Description:** Add the steps to reproduce the bug/behavior. Some things to consider:
  - what you think the correct behavior _should_ be.
  - the current behavior and how it differs.
  - the conditions required to produce the bug. For example, the buttons you clicked, the request you've made, etc.
- If you think of a solution to solve the problem, you can suggest something. Remember that your solution may not be the best solution for that specific issue/technology/repo...
- Links to any issue or discussion that relates to this issue.

### Feature Issue

- **A Title:** Clear enough to identify in few words what the problem is about.
- **Context for the issue:** Describe the feature request.
- **Proposed Solution:** What do you think the solution should be and why? If you don't have a suggestion, that's fine too!
- **Alternatives Considered:** If you have thought about other solutions, what have you thought about and why did you think they weren't the best solution to the request?
- **Links:** Any issue or discussion that relates to this issue.

### Documentation Change

- A title that is clear enough to identify in few words what the problem is about.
- Context for the issue: Describe the documentation request. For example, "I noticed an unclear explanation of how to install the software. I encountered an some issues myself."
- Proposed Solution: What do you think the solution should be and why? If you don't have a suggestion, that's fine too!

{% endtextContainer %}
