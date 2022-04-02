---
layout: layouts/resources.njk
title: Guide To Asking Questions About Your Code
description: A guide for our members to ask questions about code.
hero: 'svg/undraw_questions_re_1fy7.svg'
heroHeader: 'About Virtual Coffee'
heroSubheader: A guide for our members to ask questions about code.
tags: memberresources
eleventyNavigation:
  key: GuideToAskQuestions
  title: Guide To Asking Questions About Your Code
  excerpt: A guide for our members to ask questions about code.
  parent: DevResources
  order: 3
---

{% textContainer 'light'%}

## Hi friends 👋

{% leadText %}

Everybody runs into problems during development that can be frustrating and seem impossible to debug. The most important thing is: _if you need help, ask for help_.

We provide this guide for you to ask for help effectively in Virtual Coffee. If you're still unsure how to ask for help: _ask anyway_. We've all been there.

{% endleadText %}

---

## Table of Contents

${toc}

---

## [Code of Conduct](/code-of-conduct)

This is the most important part of Virtual Coffee. We want this community to be a welcoming, inclusive, supportive, and safe place for all our members.

We pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

_We take our Code of Conduct seriously._ You can find [a copy of it](/code-of-conduct) on our website.

### I think someone has violated the Code of Conduct. How can I report it?

You can report your experience to our Maintainers at hello@virtualcoffee.io or anonymously at [virtualcoffee.io/report-coc-violation](https://virtualcoffee.io/report-coc-violation).

{% endtextContainer %}

{% textContainer 'white' %}

## How To Ask Questions

### Before Asking Question

- Go through your code line by line.
  You want to know what your code is doing so you can answer questions. Take some notes if necessary.
- Do some research before asking questions.
  You want to avoid asking questions that you can figure out by Googling your problem. You can also improve your skill in finding solutions by Googling yourself.
- Check for some typos.
  Sometimes an error arises from a single typo.
- Google the error that you encounter by copy-pasting the error message.
  Most of the time, you can find some answers from people who encountered the same error as yours.

### When Asking Questions

#### Getting started

- A simple "Can someone help me with {something}?" is enough to get a conversation started.
- Be specific about what you're looking for.
  "Does anyone know why my MongoDB authentication failed?" is better than "My app is crashing."
- For a more general question or when trying to grasp a concept:
  "Does anyone have experience with {something}?" or "Can someone explain {something} to me like I'm five?" is a good starting point.

#### Asking questions

- Specified details as much as possible, such as:
  - What language, framework, or libraries version are you using when encountering the error?
  - What operating system (e.g., Windows, Mac, Linux) and version are you experiencing the problem on?
- Provide relevant code along with your question, if possible.
- Explain the command or steps that you run to reproduce the problem.
- Describe what you have tried to fix the problem. It's okay if you don't know where to start, but share whatever you have already tried/ruled out.
- Read through your question. You want to ensure that your question makes sense and you've included all information needed for other members to help you.

{% endtextContainer %}

{% textContainer 'light' %}

## Where to drop questions?

### Slack

**#help-and-pairing**
Ask questions about your code or ask other members' help for pairing in this channel.

You can also ask for resources, ask opinions about your project, ask for help to fill surveys, or any other support related to tech.

**#front-end**
This channel is about everything front-end and asks questions if you have problems with your front-end-related codes.

**#accessibility**
This channel is for questions, comments, tips, and answers about a11y for accessibility.

**#code-challenges**
Stuck on an algorithm? This is the place for you.

**#tech-interview-study-group**
You can always drop your questions about job searching and job interviews to this channel. This group also has a weekly meeting to discuss and learn everything about tech interviews together.

**#job-hunt**
This channel is to post any job postings. But, you can also drop your questions regarding job searching on this channel.

**#community-questions**
Do you have questions about Virtual Coffee? What do we do? What are we up to? Tools we use and how to utilize them?
Or do you have some ideas for the community that you would share?

You can drop those Virtual Coffee’s related questions here for the community to answer.

**#random**
If you are still unsure where to ask questions, you can ask them here. Some members will crosspost your question to the appropriate channel for better exposure.

Do check our complete list of channels in the [Slack channel guide](/member-resources/slack-channel-guide).

### GitHub

**Discussion board**
Do check out our [discussion board on GitHub](https://github.com/Virtual-Coffee/virtualcoffee.io/discussions)! 😄 You can use it whenever you have questions or want to throw ideas around Virtual Coffee or anything else.

{% endtextContainer %}

{% textContainer 'white' %}

## How To Utilize Slack For Asking Questions

- Unless you are a maintainer, you want to avoid using `@here` or `@channel`.
  Using these tags will notify everyone in the channel. It might be an afternoon at your time, but it is midnight in some parts of the world. And we want to respect our members. We are a very active community. Someone will answer you as soon as possible.
- When you are answering questions, make sure to reply in the thread.
  By keeping one topic in one thread, we can prevent confusion.
- Use a single backtick (`) to share technical jargon or a one-line code in a sentence.
- Use triple backtick (```) to share a code block and keep a clean format.

{% endtextContainer %}

{% textContainer 'light' %}

Special thanks to [David Alpert](https://github.com/davidalpert), [Jonathan Yeong](https://github.com/jonathanyeong), [Dan Ott](https://github.com/danieltott), [Abbey Perini](https://github.com/abbeyperini), [Mark Noonan](https://github.com/marktnoonan), [Travis Martin](https://github.com/LincolnFleet), and [Claire Martinez](https://github.com/Claire) for throwing ideas and making this guide possible! 💙

**Resources**:

- [How to be great at asking coding questions](https://medium.com/@gordon_zhu/how-to-be-great-at-asking-questions-e37be04d0603)
- [Stack Overflow Question Checklist](https://codeblog.jonskeet.uk/2012/11/24/stack-overflow-question-checklist/)
- [How do I ask a good question?](https://stackoverflow.com/help/how-to-ask)

{% endtextContainer %}
